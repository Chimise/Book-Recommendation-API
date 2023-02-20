import type Base from "./base";

interface UserSimilarityI {
    current_user_id: number;
    other_user_id: number;
    similarity_index: number;
}

export default interface UserSimilaritySchema extends UserSimilarityI, Base {}