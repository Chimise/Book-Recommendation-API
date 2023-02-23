import {Router} from "express";
import validator from "../middlewares/validator";
import isAuthenticated from "../middlewares/isAuthenticated";
import { updateUser } from "../controllers/user.controller";
import { updateUserSchema } from "../validators/user.validator";

const userRouter = Router();

userRouter.put('/', isAuthenticated, validator(updateUserSchema), updateUser);

export default userRouter;