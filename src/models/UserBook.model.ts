import UserBookSchema from "../interfaces/user_book.interface";
import UserSchema from "../interfaces/user.interface";
import BookSchema from "../interfaces/book.interface";
import Book from "./Book.model";
import User from "./User.model";
import knex from "../util/knex";
import _, { lte } from "lodash";



class UserBook {
  id: number;
  review: string;
  rating: number;
  user_id: number;
  book_id: number;
  book!: Book;
  readonly created_at: string;
  updated_at: string;

  constructor({
    id,
    review,
    rating,
    user_id,
    book_id,
    created_at,
    updated_at,
  }: UserBookSchema) {
    this.id = id;
    this.review = review;
    this.rating = rating;
    this.book_id = book_id;
    this.user_id = user_id;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  async save(...args: (keyof Omit<UserBookSchema, "id">)[]) {
    let updates: Record<string, any> = {};

    if (args.length !== 0) {
      updates = _.pick(this, args);
    } else {
      updates = _.pick(this, ["review", "rating"]);
    }

    _.set(updates, "updated_at", new Date().toISOString());

    await knex<BookSchema>("user_books").update(updates).where("id", this.id);
  }

  static async removeOne(
    data: Partial<Omit<UserBookSchema, "created_at" | "updated_at">>
  ) {
    const userBook = (
      await knex<UserBookSchema>("user_books").where(data).del("*").limit(1)
    )[0];
    if (!userBook) {
      return null;
    }
    const hydratedUserBook = new this(userBook);
    await hydratedUserBook.populateBook();
    return hydratedUserBook;
  }

  static async createMany(
    data: Partial<Omit<UserBookSchema, "id" | "created_at" | "updated_at">>[]
  ) {
    const userBooks = await knex<UserBookSchema>("user_books")
      .insert(data)
      .returning("*");
    const populatedUserBooks = userBooks.map(async (book) => {
      const hydratedUserBook = new this(book);
      await hydratedUserBook.populateBook();
      return hydratedUserBook;
    });
    const hydratedUserBooks = await Promise.all(populatedUserBooks);
    return hydratedUserBooks;
  }

  static async create(
    data: Partial<Omit<UserBookSchema, "id" | "created_at" | "updated_at">>
  ) {
    const userBook = await knex<UserBookSchema>("user_books")
      .insert(data)
      .returning("*");
    return new this(userBook[0]);
  }

  static async fetchOne(data: Partial<UserBookSchema>) {
    const userBook = await knex<UserBookSchema>("user_books")
      .where(data)
      .select("*")
      .limit(1);
    if (_.isEmpty(userBook)) {
      return null;
    }
    const hydratedUserBook = new this(userBook[0]);
    await hydratedUserBook.populateBook();
    return hydratedUserBook;
  }

  static async fetchAll(data: Partial<UserBookSchema>) {
    const userBooks = await knex<UserBookSchema>("user_books")
      .where(data)
      .select("*");
    if (_.isEmpty(userBooks)) {
      return [];
    }
    const populateUserBooks = _.map(userBooks, async (userBook) => {
      const hydratedUserBook = new this(userBook);
      await hydratedUserBook.populateBook();
      return hydratedUserBook;
    });

    const fetchedUserBooks = await Promise.all(populateUserBooks);
    return fetchedUserBooks;
  }

  static async fetchOneWithRelated(
    data: Partial<Omit<BookSchema, "created_at" | "updated_at">>,
    user: User | Pick<User, "id">
  ) {
    const book = await Book.fetchOne(data);
    if (!book) {
      return null;
    }
    const userBook = await this.fetchOne({
      user_id: user.id,
      book_id: book.id,
    });
    if (!userBook) {
      return null;
    }
    await userBook.populateBook();
    return userBook;
  }

  async populateBook() {
    const books: BookSchema[] = await knex<UserBook>("user_books")
      .join<BookSchema>("books", "user_books.book_id", "books.id")
      .join("users", "user_books.user_id", "users.id")
      .where("users.id", this.user_id)
      .andWhere("books.id", this.book_id)
      .select("books.*")
      .limit(1);
    if (_.isEmpty(books)) {
      return null;
    }
    this.book = new Book(books[0]);
    await this.book.populateAuthors();
    return this.book;
  }

  static async getBooksByUserRating(
    data: Pick<User, "id"> | Pick<User, "id">[],
    ratingType?: "like" | "dislike"
  ) {
    let books: BookSchema[];
    let query = knex<UserBookSchema>("user_books")
      .join<BookSchema>("books", "user_books.book_id", "books.id")
      .select("books.*");
    if (_.isArray(data)) {
      const userIds = data.map((user) => user.id);
      //@ts-ignore
      query = query.distinct("books.id").whereIn("user_books.user_id", userIds);
    } else {
      query = query.where("user_books.user_id", data.id);
    }
    if (!ratingType) {
      books = await query;
    } else if (ratingType === "like") {
      books = await query.andWhere("user_books.rating", ">", 0);
    } else {
      books = await query.andWhere("user_books.rating", "=", 0);
    }
    if (_.isEmpty(books)) {
      return [];
    }
    return _.map(books, (book) => new Book(book));
  }


  static async getUsersByBookRating(
    data: Pick<Book, "id"> | Pick<Book, "id">[],
    ratingType?: "like" | "dislike"
  ) {
    let users: UserSchema[];
    // Join the user_books table to the user table to get the list of users that have a added a book to library
    let query = knex<UserBookSchema>("user_books")
      .join<UserSchema>("users", "user_books.user_id", "users.id")
      .select("users.*");
    if (_.isArray(data)) {
      const bookIds = data.map((book) => book.id);
      //@ts-ignore
      query = query.distinct("users.id").whereIn("user_books.book_id", bookIds);
    } else {
      query = query.where("user_books.book_id", data.id);
    }

    if (!ratingType) {
      users = await query;
    } else if ((ratingType = "like")) {
      users = await query.andWhere("user_books.rating", ">", 0);
    } else {
      users = await query.andWhere("user_books.rating", 0);
    }

    if (_.isEmpty(users)) {
      return [];
    }

    return _.map(users, (user) => new User(user));
  }

  toJSON() {
    const { id, review, rating, book_id, user_id, book } = this;
    const data = {
      id,
      review,
      rating,
      book,
      user_id,
      book_id,
    };

    if (book) {
      _.set(data, "book", book);
      _.unset(data, "book_id");
    }
    return data;
  }
}

export default UserBook;
