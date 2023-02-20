import {Request} from 'express';
import User from '../models/User.model';
import UserBook from './user_book.interface';

export interface AuthenticatedRequest extends Request {
    user?: User;
}

export interface GetBookQuery {
    search: string;
    limit: number;
    page: number;
    sort?: string;
}

export interface BookDocs {
    key: string;
    type: string;
    title: string;
    edition_count: number;
    first_publish_year: number;
    author_key: string[];
    author_name: string[];
    cover_i: number;
}

export interface BookSearch {
    numFound: number;
    start: number;
    numFoundExact: boolean;
    q: string;
    docs: BookDocs[]
}

interface AuthorBookInfo {
    type: Pick<BookDocs, 'key'>
    author: Pick<BookDocs, 'key'>
}

export interface BookInfo {
    description: string;
    title: string;
    covers: number[];
    key: string;
    authors: Array<AuthorBookInfo>;
}

export type CreateBook = Pick<BookDocs, 'key'|'first_publish_year'>

export interface AuthorInfo {
    key: string;
    name: string;
    bio: string;
}

export type BookUpdate = Partial<Pick<UserBook, 'review'|'rating'>>;