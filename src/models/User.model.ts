import bcryptjs from "bcryptjs";
import UserSchema from "../interfaces/user.interface";
import UserBookSchema from "../interfaces/user_book.interface";
import { Knex } from "knex";
import knex from "../util/knex";
import _ from "lodash";
import Book from "./Book.model";
import UserBook from "./UserBook.model";
import UserSimilarity from "./UserSimilarity.model";
import BookSchema from "../interfaces/book.interface";

class User {
  id: number;
  full_name: string;
  email: string;
  password: string;
  password_reset_token: string | null;
  password_reset_expires: string | null;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  books: UserBook[];

  constructor(user: UserSchema) {
    this.id = user.id;
    this.full_name = user.full_name;
    this.email = user.email;
    this.password = user.password;
    this.password_reset_token = user.password_reset_token;
    this.password_reset_expires = user.password_reset_expires;
    this.email_verified = user.email_verified;
    this.created_at = user.created_at;
    this.updated_at = user.updated_at;
    this.books = [];
  }

  async save(...args: (keyof Omit<UserSchema, 'created_at'|'updated_at'|'id'>)[]) {
    let updates: Record<string, any> = {};

    if (args.length !== 0) {
      updates = _.pick(this, args);
    } else {
      updates = _.pick(this, [
        "full_name",
        "email",
        "password",
        "email_verified",
        "password_reset_token",
        "password_reset_expires",
      ]);
    }
    _.set(updates, "updated_at", new Date().toISOString());
    if (updates.password) {
      updates.password = await bcryptjs.hash(updates.password, 10);
    }

    await knex<UserSchema>("users").update(updates).where("id", this.id);
  }

  async remove() {
    await knex<UserSchema>("users").where("id", this.id).del();
  }

  async comparePassword(enteredPassword: string) {
    return bcryptjs.compare(enteredPassword, this.password);
  }

  static async fetchOne(
    data: Partial<Pick<UserSchema, "id" | "full_name" | "email">>
  ) {
    const users = await knex<UserSchema>("users")
      .select("*")
      .where(data)
      .limit(1);
    if (!users[0]) {
      return null;
    }
    return new User(users[0]);
  }

  static async rawOne(
    query: (
      instance: Knex.QueryBuilder<UserSchema, UserSchema[]>
    ) => Promise<UserSchema[]>
  ) {
    const knexInstance = knex<UserSchema>("users");
    const users = await query(knexInstance);
    if (users.length === 0) {
      return;
    }
    return new User(users[0]);
  }

  static async raw(
    query: (
      instance: Knex.QueryBuilder<UserSchema, UserSchema[]>
    ) => Promise<UserSchema[]>
  ) {
    const knexInstance = knex<UserSchema>("users");
    const users = await query(knexInstance);
    if (users.length === 0) {
      return [];
    }
    return users.map((user) => new User(user));
  }


  static async create(
    data: Pick<UserSchema, "full_name" | "email" | "password">
  ) {
    const hashedPassword = await bcryptjs.hash(data.password, 10);
    const users = await knex<UserSchema>("users")
      .insert({
        ...data,
        password: hashedPassword,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning("*");
    return new User(users[0]);
  }


  async populateBooks() {
    const userBooks = await UserBook.fetchAll({ user_id: this.id });
    this.books = this.books.concat(userBooks);
    return userBooks;
  }


  async fetchBook(bookData: Partial<Omit<BookSchema, 'created_at'|'updated_at'>>) {
    const userBook = await UserBook.fetchOneWithRelated(bookData, this);
    return userBook;
  }

  async getLikedBooks() {
    const books = await UserBook.getBooksByUserRating(this, 'like');
    return books;
  }

  async getDislikedBooks() {
    const books = await UserBook.getBooksByUserRating(this, 'dislike');
    return books;
  }

  async getSimilarUsers() {
    const similarUsers = await UserSimilarity.fetchAllByUser(this);
    return similarUsers;
  }

  async deleteSimilarUsers() {
    await UserSimilarity.deleteByUser(this);
  }

  async addBook(book: Book) {
    const userBook = await UserBook.create({
      book_id: book.id,
      user_id: this.id,
    });
    await userBook.populateBook();
    this.books = this.books.concat(userBook);
    return userBook;
  }


  toJSON() {
    return _.pick(this, [
      "id",
      "full_name",
      "email",
      "created_at",
      "updated_at",
    ]);
  }
}

export default User;
