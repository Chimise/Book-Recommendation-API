import {Request, Response, NextFunction} from 'express';
import RequestError from '../util/RequestError';


const errorHandler = async (err: unknown, req: Request, res: Response, next: NextFunction) => {
    let error: RequestError;

    if(err instanceof RequestError) {
        error = err;
    }else if (err instanceof Error) {
        error = new RequestError(err.message);
    }else {
        error = new RequestError('An error occured')
    }
    res.status(error.code).json(error);
}

export default errorHandler;