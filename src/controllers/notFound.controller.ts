import { Request, Response, NextFunction } from "express";
import RequestError from "../util/RequestError";

const notFound = (req: Request, res: Response, next: NextFunction) => {
    const error = new RequestError('The Resource was not found', 404);
    next(error);
}


export default notFound;