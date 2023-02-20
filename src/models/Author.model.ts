import _ from 'lodash';
import {Knex} from 'knex';
import knex from "../util/knex";
import AuthorSchema from "../interfaces/author.interface";

class Author {
    id: number;
    name: string;
    bio: string;
    identifier: string;
    created_at: string;
    updated_at: string;

    constructor ({id, name, bio, identifier, created_at, updated_at}: AuthorSchema) {
        this.id = id;
        this.name = name;
        this.bio = bio;
        this.identifier = identifier;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    static async fetchOne(data: Omit<AuthorSchema, 'created_at'|'updated_at'>) {
        const authors = await knex<AuthorSchema>('authors').select('*').where(data).limit(1);
        if(_.isEmpty(authors)) {
            return;
        }
        return new this(authors[0]);
    }

    static async fetch(data: Omit<AuthorSchema, 'created_at'|'updated_at'>) {
        const authors = await knex<AuthorSchema>('authors').select('*').where(data);
        if(_.isEmpty(authors)) {
            return [];
        }
        return _.map(authors, author => new this(author));
    }

    static async insertMany(data: Omit<AuthorSchema, 'created_at'|'updated_at'|'id'>[]) {
        const authors = await knex<AuthorSchema>('authors').insert(data).returning('*');
        if(_.isEmpty(authors)) {
            return [];
        }
        return authors.map(author => new this(author));
    }

    static async raw<T extends any[] = AuthorSchema[]>(query: (
        instance: Knex.QueryBuilder<AuthorSchema, AuthorSchema[]>
      ) => Promise<T>) {
        const knexInstance = knex<AuthorSchema>('authors');
        const authors = await query(knexInstance);
        if(_.isEmpty(authors)) {
            return [];
        }
        return authors.map(author => new this(author));
      }
    
}

export default Author;