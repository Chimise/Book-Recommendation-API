import {Router} from 'express';
import {registerUser, logInUser, getAuthToken, verifyUserEmail, sendVerificationEmail, forgotPassword, updatePassword} from '../controllers/auth.controller';
import validator from '../middlewares/validator';
import { registerSchema, updatePasswordSchema} from '../validators/auth.validator';

const authRouter = Router();

authRouter.post('/register', validator(registerSchema), registerUser);

authRouter.post('/signin', validator(registerSchema.omit(['full_name'])), logInUser);

authRouter.get('/token', getAuthToken);

authRouter.get('/verify-email', verifyUserEmail)

authRouter.post('/verify-email', validator(registerSchema.pick(['email'])), sendVerificationEmail);

authRouter.post('/forgot-password', validator(registerSchema.pick(['email'])), forgotPassword);

authRouter.post('/update-password', validator(updatePasswordSchema), updatePassword);

export default authRouter;
