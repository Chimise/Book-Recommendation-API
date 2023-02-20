import knex from "../util/knex";
import UserSimilaritySchema from "../interfaces/user_similarity.interface";
import UserSchema from "../interfaces/user.interface";
import User from './User.model';
import _ from 'lodash';

class UserSimilarity {
    id: number;
    current_user_id: number;
    other_user_id: number;
    similarity_index: number;
    created_at: string;
    updated_at: string;

    constructor({id, current_user_id, other_user_id, similarity_index, created_at, updated_at}: UserSimilaritySchema) {
        this.id = id;
        this.current_user_id = current_user_id;
        this.other_user_id = other_user_id;
        this.similarity_index = similarity_index;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    static async fetchAllByUser(data: Pick<User, 'id'>) {
        const similarUsers: (UserSchema & Pick<UserSimilaritySchema, 'similarity_index'>)[]  = await knex<UserSimilaritySchema>('users_similarity').join('users', 'users_similarity.other_user_id', 'users.id').where('users_similarity.current_user_id', data.id).select('users.*', 'users_similarity.similarity_index');
        if(_.isEmpty(similarUsers)) {
            return [];
        }
        
        return similarUsers.map(({similarity_index, ...user}) => ({
            user: new User(user),
            similarity_index
        }));
    }

    static async deleteByUser(data: Pick<User, 'id'>) {
        await knex<UserSimilaritySchema>('users_similarity').where('current_user_id', data.id).del();
    }

    static async create(data: Omit<UserSimilaritySchema, 'id'|'created_at'|'updated_at'> | Omit<UserSimilaritySchema, 'id'|'created_at'|'updated_at'>[] ) {
        await knex<UserSimilaritySchema>('users_similarity').insert(data).returning('*');
    }

    static async fetchOne(data: Partial<Omit<UserSimilaritySchema, 'created_at'|'updated_at'>>) {
        const similarUser = await knex<UserSimilaritySchema>('users_similarity').select('*').where(data).limit(1);
        if(_.isEmpty(UserSimilarity)) {
            return null;
        }
        return new this(similarUser[0]);
    }

}

export default UserSimilarity;