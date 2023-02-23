import express from "express";
import bodyparser from 'body-parser';
import cors from 'cors';
import errorHandler from "./controllers/error.controller";
import authRouter from "./routes/auth.route";
import bookRouter from './routes/book.route';
import userRouter from "./routes/user.route";
import notFound from "./controllers/notFound.controller";

const app = express()

app.set('port', process.env.PORT || 5000);

app.use(cors());

app.use(bodyparser.json());

app.use('/auth', authRouter);

app.use('/books', bookRouter);

app.use('/users', userRouter);

app.use(errorHandler);

app.use('*', notFound);

export default app;