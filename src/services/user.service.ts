import User from "../models/User.model"
import UserBook from "../models/UserBook.model";
import _ from 'lodash';
import UserSimilarity from "../models/UserSimilarity.model";
import UserSuggestion from "../models/UserSuggestion.model";
import Book from "../models/Book.model";

export const updateUserSimilarity = async (user: User) => {
    // Books that has been liked by this user from 1 rating and above
    const likedBooks = await user.getLikedBooks();
    // Books with zero rating
    const dislikedBooks = await user.getDislikedBooks();

    // Get all the distinct users that added this book to their library
    const users = await UserBook.getUsersByBookRating([...likedBooks, ...dislikedBooks]);
    
    // Remove the current user from the list of users if exists
    const otherUsers = _.filter(users, otherUser => otherUser?.id !== user?.id);

    if(_.isEmpty(otherUsers)) {
        return;
    }

    // Delete previously generated similarity_index for this user
    await user.deleteSimilarUsers();

    // Get the books liked and diskliked by this other user and also compute the similarity_index between the user and the current user
    const similarUsersPromise = otherUsers.map(async (otherUser) => {
        const otherUserLikedBooks = await user.getLikedBooks();
        const otherUserDislikedBooks = await user.getDislikedBooks();
        const similarity_index = (_.intersectionBy(likedBooks, otherUserLikedBooks, 'id').length + _.intersectionBy(dislikedBooks, otherUserDislikedBooks, 'id').length - _.intersectionBy(likedBooks, otherUserDislikedBooks, 'id').length - _.intersectionBy(dislikedBooks, otherUserLikedBooks, 'id').length) / _.unionBy(likedBooks, dislikedBooks, otherUserLikedBooks, otherUserDislikedBooks, 'id').length;
        return {
            current_user_id: user.id,
            other_user_id: otherUser.id,
            similarity_index
        }
    })

    // Await the promise to complete
    const similarUsers = await Promise.all(similarUsersPromise);
    await UserSimilarity.create(similarUsers);
}


export const updateUserSuggestions = async (user: User) => {
    // Get all users that share a similarity index with the current user
    const similarUsers = await user.getSimilarUsers();
    
    // Get all books that the user has added to his library;
    const userBooks = await UserBook.getBooksByUserRating(user);

    // Get all the books that these similar users have added to their library
    const otherUserBooks = await UserBook.getBooksByUserRating(_.map(similarUsers, similarUser => similarUser.user));

    // Remove books that already exist in the user library
    const filteredBooks = _.differenceBy(otherUserBooks, userBooks, 'id');


    if(_.isEmpty(filteredBooks)) {
        return;
    }

    // Delete previous generated suggestions for this user if they exist
    await UserSuggestion.deleteByUser(user);

    const suggestionsPromise = filteredBooks.map(async book => {
        // Get all the users that rated this book from 1 star rating upwards
        const allUserLikedBook = await UserBook.getUsersByBookRating(book, 'like');
        //Get all the users that never rated this book but have it in their library
        const allUserDislikedBook = await UserBook.getUsersByBookRating(book, 'dislike');

        let numerator = 0;
        // Filter the current user from these list of users
        const otherUsers = _.filter([...allUserLikedBook, ...allUserDislikedBook], otherUser => otherUser.id !== user.id);
        
        for (const otherUser of otherUsers) {
            // Check if the similarity index of these user with the current user has already been computed
            const similarUser = similarUsers.find(similarUser => similarUser.user.id === otherUser.id);
            if(similarUser) {
               numerator += similarUser.similarity_index;
            }
        }

        const weight = (numerator / _.union(allUserDislikedBook, allUserLikedBook).length) || 0

        return {
            user_id: user.id,
            weight: _.round(weight, 2),
            book_id: book.id
        }
    })

    const suggestions = await Promise.all(suggestionsPromise);

    await  UserSuggestion.create(suggestions);
}


export const userSuggestionsByRating = async (user: User) => {
    const books = await Book.getByAvgRating();
    const userBooks = (await UserBook.fetchAll({user_id: user.id})).map(userBook => userBook.book);
    return _.differenceBy(books, userBooks, 'id');
}
