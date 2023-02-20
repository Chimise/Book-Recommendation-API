import jwt, {SignOptions, JwtPayload} from 'jsonwebtoken';
import { JWT_SECRET, JWT_REFRESH_SECRET } from '../config/secrets';
import User from '../models/User.model';
import RequestError from '../util/RequestError';

const generateRefreshSecret = (password: string) => {
    return password + JWT_REFRESH_SECRET!;
}


export const generateAuthToken = (payload: User, options: SignOptions = {}, isEmailToken: boolean = false) => {
    return jwt.sign(isEmailToken ? {email: payload.email} : {id: payload.id}, JWT_SECRET!, {expiresIn: 5 * 60, ...options});
}


export function verifyAuthToken(token: string): Pick<User, 'id'>;
export function verifyAuthToken(token: string, isEmailToken: boolean): Pick<User, 'email'>;
export function verifyAuthToken(token: string, isEmailToken?: boolean){
    let payload = jwt.verify(token, JWT_SECRET!);
    if(isEmailToken) {
        return payload as  Pick<User, 'email'>
    }
    return payload as Pick<User, 'id'>
}

export const generateRefreshToken = (payload: User, options: SignOptions = {}) => {
    return jwt.sign({id: payload.id}, generateRefreshSecret(payload.password), {expiresIn: '1y', ...options});
}

export const verifyRefreshToken = async (token: string) => {
    const payload = jwt.decode(token) as Pick<User, 'id'>;
    if(!payload.id) {
        throw new RequestError('Invalid credentials', 403);
    } 

    const user = await User.fetchOne({id: payload.id});
    if(!user) {
        throw new RequestError('Invalid credentials', 403)
    }
    try {
        jwt.verify(token, generateRefreshSecret(user.password)) as Pick<User, 'id'>;
        return user;
    } catch (error) {
        throw new RequestError('Invalid credentials', 403);
    }
}

export const getTokens = (user: User, authOptions: SignOptions = {}, refreshOptions: SignOptions = {}) => {
    return [generateAuthToken(user, authOptions), generateRefreshToken(user, refreshOptions)];
}