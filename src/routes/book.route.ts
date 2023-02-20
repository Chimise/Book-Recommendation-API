import {Router} from 'express';
import {searchBooks, create, findUserBooks, updateBook, deleteBook} from '../controllers/book.controller';
import validator from '../middlewares/validator';
import isAuthenticated from '../middlewares/isAuthenticated';
import { searchBookSchema, createBookSchema,  updateBookSchema} from '../validators/book.validator';

const router = Router();

router.get('/query', validator(searchBookSchema, 'query'), searchBooks);

router.post('/', isAuthenticated, validator(createBookSchema), create);

router.get('/', isAuthenticated, findUserBooks);

router.put('/:id', isAuthenticated, validator(updateBookSchema), updateBook);

router.delete('/:id', isAuthenticated, deleteBook);

export default router;