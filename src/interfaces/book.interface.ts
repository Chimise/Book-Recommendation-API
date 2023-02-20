import type Base from "./base";

interface Book {
  title: string;
  description: string;
  publication_year: number;
  cover_image: string;
  identifier: string;
}

export default interface BookSchema extends Book, Base {};
