import type Base from "./base";

interface Author {
    name: string;
    bio: string;
    identifier: string;
}

export default interface AuthorSchema extends Author, Base {}