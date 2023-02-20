import _ from 'lodash';
import knex from "../util/knex";
import type UserSuggestionSchema from "../interfaces/user_suggestion.interface";
import type BookSchema from "../interfaces/book.interface";
import User from "./User.model";
import Book from "./Book.model";


class UserSuggestion {
    id: number;
    book_id: number;
    user_id: number;
    weight: number;
    created_at: string;
    updated_at: string;

    static db: string = 'user_suggestions';

    constructor({id, book_id, user_id, weight, created_at, updated_at}: UserSuggestionSchema) {
        this.id = id;
        this.book_id = book_id;
        this.user_id = user_id;
        this.weight = weight;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    static async deleteByUser(data: Pick<User, 'id'>) {
        await knex<UserSuggestionSchema>(this.db).del().where('user_id', data.id);
    }

    static async create(data: Omit<UserSuggestionSchema, 'id'|'created_at'|'updated_at'> | Omit<UserSuggestionSchema, 'id'|'created_at'|'updated_at'>[]) {
        await knex<UserSuggestionSchema>(this.db).insert(data);
    }

    static async fetchByUser(data: Pick<User, 'id'>) {
        const suggestedBooks: BookSchema[] = await knex<UserSuggestionSchema>(this.db).join('books', `${this.db}.book_id`, 'books.id').select('books.*').where(`${this.db}.user_id`, data.id);
        if(_.isEmpty(suggestedBooks)) {
            return [];
        }
        return _.map(suggestedBooks, book => new Book(book));
    }


}

export default UserSuggestion;