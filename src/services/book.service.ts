import _ from "lodash";
import type {
  GetBookQuery,
  BookSearch,
  CreateBook,
  BookInfo,
  AuthorInfo,
  BookUpdate,
} from "../interfaces";
import type UserBookI from "../interfaces/user_book.interface";
import { sendRequest } from "../util";
import Book from "../models/Book.model";
import UserBook from "../models/UserBook.model";
import Author from "../models/Author.model";
import User from "../models/User.model";
import RequestError from "../util/RequestError";
import { updateUserSimilarity, updateUserSuggestions } from "./user.service";

const fields = [
  "key",
  "type",
  "first_publish_year",
  "author_key",
  "author_name",
  "title",
  "edition_count",
  "cover_i",
];

const getBookImage = (id: number, size: "S" | "M" | "L" = "M") => {
  return `https://covers.openlibrary.org/b/id/${id}-${size}.jpg`;
};

export const findBooks = async ({
  search,
  limit,
  sort,
  page,
}: GetBookQuery) => {
  // The search string is in the form "title:Hello World" or without the seperator "Hello World";
  const [field, value] = search.split(":");

  const query = new URLSearchParams();
  // If title & value is available, then the title will be in the form 'subject', 'title', 'author';
  if (field && value) {
    query.set(field, value);
  } else {
    // The field is a search string
    query.set("q", field);
  }
  query.set("fields", fields.join(","));
  query.set("limit", limit.toString());
  if (sort) {
    query.set("sort", sort);
  }
  query.set("page", page.toString());

  const { docs, start, numFound, numFoundExact, q } =
    await sendRequest<BookSearch>(`/search.json?${query.toString()}`);
  // Reorganize the request body

  try {
    const newBookDocs = _.map(docs, (doc) => {
      const authors = _.map(doc.author_key, (authorKey, index) => {
        return {
          key: authorKey,
          name: doc.author_name[index],
        };
      });
      return {
        ..._.omit(doc, ["author_key", "author_name", "cover_i"]),
        authors,
        cover_image: getBookImage(doc.cover_i),
      };
    });
    return {
      start,
      numFound,
      numFoundExact,
      q,
      docs: newBookDocs,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const addBookToUserLib = async (
  { key, first_publish_year }: CreateBook,
  user: User
) => {
  // Check if the book that the user want's to add already exist in the db
  let book = await Book.fetchOne({ identifier: key });

  //If the book does not exist, fetch the details from open library api
  if (!book) {
    const data = await sendRequest<BookInfo>(`${key}.json`);
    // Pick the required fields and save it to the database
    const bookData = {
      ..._.pick(data, ["description", "title"]),
      // @ts-ignore
      cover_image: getBookImage(_.first(_.pick(data, ["covers"]))),
      publication_year: first_publish_year,
      identifier: key,
    };

    book = await Book.create(bookData);

    // Get the author or authors of the book
    const authorIds = data.authors.map((authorData) => authorData.author.key);

    // Check if some or all the authors have been previously saved in the database
    let authors = await Author.raw((query) => {
      return query.select("*").whereIn("identifier", authorIds);
    });

    const savedAuthorIds = authors.map((author) => author?.identifier);
    // If the authors found in the db are not the same with the authors of the book, then some authors have not been saved
    if (authorIds.length !== savedAuthorIds.length) {
      const unsavedAuthorIds = _.difference(authorIds, savedAuthorIds).map(
        (authorId) => {
          return sendRequest<AuthorInfo>(`${authorId}.json`, {
            retryDelay: 500,
          });
        }
      );

      // Fetch details of the author from the open api library

      const fetchedAuthors = (await Promise.allSettled(unsavedAuthorIds))
        .map((data) => {
          if (data.status === "fulfilled") {
            return {
              identifier: data.value.key,
              bio: data.value.bio,
              name: data.value.name,
            };
          }
        })
        .filter((value) => Boolean(value));

      // Store the author in the database
      //@ts-ignore
      const newAuthors = await Author.insertMany(fetchedAuthors);

      // Add the newly created authors to the list of authors that existed previously
      authors = authors.concat(newAuthors);
    }
    // Relate authors to the book
    await book.addAuthors(authors);
  }

  // Add the books to the user
  const userBook = await user.addBook(book);
  return userBook;
};

export const updateUserBook = async (
  book: UserBook,
  { review, rating }: BookUpdate,
  user: User
) => {
  // Resave the fields in this array to the database, don't do this in production
  let updates = [] as unknown as (keyof Omit<UserBookI, "id">)[];
  if (rating) {
    updates.push("rating");
    book.rating = rating;

    setTimeout(() => {
      updateUserSimilarity(user)
        .then(() => updateUserSuggestions(user))
        .catch((error) => console.log(error));
    }, 1000);
  }
  if (review) {
    updates.push("review");
    book.review = review;
  }
  await book.save(...updates);
  await book.book.getAvgRating();
  return book;
};

export const deleteUserBook = async (id: number, user: User) => {
  const userBook = await UserBook.removeOne({ id, user_id: user.id });
  if (!userBook) {
    throw new RequestError("User book not found", 404);
  }
  return userBook;
};
