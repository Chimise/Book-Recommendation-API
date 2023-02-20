import Base from "./base";

interface BooksAuthorI {
    book_id: number;
    author_id: number;
}

export default interface BookAuthorSchema extends BooksAuthorI, Base {};