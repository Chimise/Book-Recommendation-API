import BookSchema from "../interfaces/book.interface";
import AuthorSchema from "../interfaces/author.interface";
import BooksAuthorSchema from "../interfaces/books_author.interface";
import { Knex } from "knex";
import Author from "./Author.model";
import knex from "../util/knex";
import _ from "lodash";

class Book {
  id: number;
  title: string;
  description: string;
  publication_year: number;
  cover_image: string;
  identifier: string;
  created_at: string;
  updated_at: string;
  authors: Author[]

  constructor({
    id,
    description,
    publication_year,
    cover_image,
    title,
    identifier,
    created_at,
    updated_at,
  }: BookSchema) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.publication_year = publication_year;
    this.cover_image = cover_image;
    this.identifier = identifier;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.authors = [];
  }

  async save(...args: (keyof BookSchema)[]) {
    let updates: Record<string, any> = {};

    if (args.length !== 0) {
      updates = _.pick(this, args);
    } else {
      updates = _.omit(this, ["updated_at"]);
    }
    _.set(updates, "updated_at", new Date().toISOString());

    await knex<BookSchema>("books").update(updates).where("id", this.id);
  }

  async populateAuthors() {
    const authors: Array<AuthorSchema> = await knex<BookSchema>('books').join<BooksAuthorSchema>('book_authors', 'books.id', 'book_authors.book_id').join<AuthorSchema>('authors', 'book_authors.author_id', 'authors.id').select('authors.*').where('books.id', this.id);
    if(_.isEmpty(authors)) {
      return [];
    }
    this.authors = authors.map(author => new Author(author));
    return this.authors;
  }

  async addAuthors(authors: Author | Author[]) {
    
    let bookData: Pick<BooksAuthorSchema, 'author_id'|'book_id'> | Pick<BooksAuthorSchema, 'author_id'|'book_id'>[];
    if(_.isArray(authors)) {
      bookData = authors.map(author => ({
        author_id: author.id,
        book_id: this.id
      }))
    }else {
      bookData = {
        author_id: authors.id,
        book_id: this.id
      }
    }
    await knex('book_authors').insert(bookData);
    this.authors = this.authors.concat(authors);
  }

  async remove() {
    await knex<BookSchema>('books').del().where('id', this.id);
  }

  static async fetchOne(data: Partial<Omit<BookSchema, 'created_at'|'updated_at'>>) {
    const books = await knex<BookSchema>('books').select('*').where(data).limit(1);
    if(books.length === 0) {
        return null;
    }

    return new this(books[0]);
  }

  static async fetchAll(data: Partial<Omit<BookSchema, 'created_at'|'updated_at'>>) {
    const books = await knex<BookSchema>('books').select('*').where(data);
    if(_.isEmpty(books)) {
        return [];
    }
    return _.map(books, book => new this(book));
  }



  static async raw(query: (
    instance: Knex.QueryBuilder<BookSchema, BookSchema[]>
  ) => Promise<BookSchema[]>) {
    const knexInstance = knex<BookSchema>('books');
    const books = await query(knexInstance);
    if(_.isEmpty(books)) {
        return [];
    }
    return _.map(books, book => new this(book));
  }

  static async create(data: Omit<BookSchema, 'id'|'created_at'|'updated_at'|'authors'>) {
    const books = await knex<BookSchema>('books').insert(data).returning('*');
    return new Book(books[0]);
  }

  static async createMany(data: Omit<BookSchema, 'id'|'created_at'|'updated_at'|'authors'>[]) {
    const books = await knex<BookSchema>('books').insert(data).returning('*');
    return _.map(books, book => new Book(book));
  }

  static async rawOne(query: (
    instance: Knex.QueryBuilder<BookSchema, BookSchema[]>
  ) => Promise<BookSchema[]>) {
    const knexInstance = knex<BookSchema>('books');
    const books = await query(knexInstance);
    if(_.isEmpty(books)) {
        return;
    }
    return new this(books[0]);
  }

  

  toJSON() {
    return this;
  }

}

export default Book;