import Base from "./base";

interface UserSuggestionI {
    book_id: number;
    user_id: number;
    weight: number;
}

export default interface UserSuggestionSchema extends UserSuggestionI, Base {}