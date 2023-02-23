import { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../interfaces";
import UserSchema from "../interfaces/user.interface";

export const updateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const {full_name, password} = req.body as Partial<Pick<UserSchema, 'full_name'|'password'>>;
    const updates = [];
    try {
        if(full_name) {
            req.user!.full_name = full_name;
            updates.push('full_name');
        }
        if(password) {
            req.user!.password = password;
            updates.push('password');
        }
        //@ts-ignore
        await req.user!.save(...updates);
        res.json(req.user)
    } catch (error) {
        next(error);
    }
}