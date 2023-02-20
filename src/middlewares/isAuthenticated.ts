import {Response, NextFunction} from 'express';
import { AuthenticatedRequest } from '../interfaces';
import User from '../models/User.model';
import { verifyAuthToken } from '../services/jwt.service';
import RequestError from '../util/RequestError';

const unAuthenticatedErr = new RequestError('Invalid Credentails', 401)

const isAuthenticated = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ').slice(-1)[0];
    try {
        if(!token) {
            throw unAuthenticatedErr;
        }

        const {id} = verifyAuthToken(token);
        const user = await User.fetchOne({id});
        if(!user) {
            throw unAuthenticatedErr;
        }
        
        req.user = user;
        next()
    } catch (error) {
        const err = error instanceof RequestError ? error : unAuthenticatedErr;
        next(err);
    }

}

export default isAuthenticated;