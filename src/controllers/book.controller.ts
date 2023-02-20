import { Request, Response, NextFunction } from "express";
import {
  findBooks,
  addBookToUserLib,
  updateUserBook,
  deleteUserBook,
} from "../services/book.service";
import { GetBookQuery, CreateBook, BookUpdate } from "../interfaces";
import { AuthenticatedRequest } from "../interfaces";
import UserBook from "../models/UserBook.model";
import RequestError from "../util/RequestError";

export const searchBooks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const query = req.query as unknown as GetBookQuery;
  try {
    const books = await findBooks(query);
    res.json(books);
  } catch (error) {
    next(error);
  }
};

export const create = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const body = req.body as CreateBook;
  try {
    let book = await req.user!.fetchBook({ identifier: body.key });
    if (!book) {
      book = await addBookToUserLib(body, req.user!);
    }
    res.status(201).json(book);
  } catch (err) {
    next(err);
  }
};

export const findUserBooks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const books = await req.user!.populateBooks();
    res.json(books);
  } catch (error) {
    next(error);
  }
};

export const updateBook = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    const body = req.body as BookUpdate;
    if (!id) {
      throw new RequestError("Invalid Book Id", 400);
    }
    const userBook = await UserBook.fetchOne({
      user_id: req.user!.id,
      id
    });

    if (!userBook) {
      throw new RequestError("Book not found", 404);
    }

    const updatedBook = await updateUserBook(userBook, body, req.user!);

    res.json(updatedBook);
  } catch (error) {
    next(error);
  }
};

export const deleteBook = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    const userBook = await deleteUserBook(id, req.user!);
    res.json(userBook);
  } catch (error) {
    next(error);
  }
};
