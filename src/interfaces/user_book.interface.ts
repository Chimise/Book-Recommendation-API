import type Base from "./base";

interface UserBookI {
    rating: number;
    review: string;
    book_id: number;
    user_id: number;
}

export default interface UserBookSchema extends UserBookI, Base {};