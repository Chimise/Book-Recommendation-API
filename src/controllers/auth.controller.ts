import { Request, Response, NextFunction } from "express";
import type { UserI } from "../interfaces/user.interface";
import User from "../models/User.model";
import RequestError from "../util/RequestError";
import {
  getTokens,
  verifyRefreshToken,
  generateAuthToken,
  verifyAuthToken,
} from "../services/jwt.service";
import { sendWelcomeEmail, sendUpdatePasswordEmail, sendUpdatePasswordSuccessEmail } from "../services/auth.service";
import { getQueryValue } from "../util";
import {ENVIRONMENT} from '../config/secrets';

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, full_name, password } = req.body as UserI;
  try {
    const user = await User.fetchOne({ email });
    if (user) {
      throw new RequestError("Email already exist", 400);
    }
    const newUser = await User.create({ email, full_name, password });
    res.status(201).send({ user: newUser });
    if(ENVIRONMENT === 'production') {
      await sendWelcomeEmail(newUser);
    }
  } catch (error) {
    next(error);
  }
};

export const logInUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body as Pick<User, "email" | "password">;
  try {
    const user = await User.fetchOne({ email });
    if (!user) {
      throw new RequestError("Invalid Credentials", 401);
    }
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      throw new RequestError("Invalid Credentials", 401);
    }

    if (ENVIRONMENT === 'production' && !user.email_verified) {
      throw new RequestError(
        "Your email has not been verified, very your email to login",
        403
      );
    }

    const [authToken, refreshToken] = getTokens(user);
    return res.json({ user, tokens: { authToken, refreshToken } });
  } catch (error) {
    next(error);
  }
};

export const getAuthToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  try {
    if (!token) {
      throw new RequestError("Invalid Credentials", 403);
    }
    const user = await verifyRefreshToken(token);
    const authToken = generateAuthToken(user);
    return res.json({ authToken });
  } catch (error) {
    next(error);
  }
};

//Verify the email address when the user clicks the link in the sent email
export const verifyUserEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = getQueryValue(req.query, "code");
    if (!token) {
      throw new RequestError("Payload not attached", 400);
    }
    const { email } = verifyAuthToken(token, true);
    const user = await User.fetchOne({ email });
    if (!user) {
      throw new RequestError("User not found", 404);
    }
    if (!user.email_verified) {
      user.email_verified = true;
      await user.save("email_verified");
    }
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};


// Send email verification manually using this endpoint
export const sendVerificationEmail = async (req: Request, res: Response, next: NextFunction) => {
  const {email} = req.body as Pick<User, 'email'>
  try {
    const user = await User.fetchOne({email});
    if(!user) {
      throw new RequestError('Email not found', 404);
    }
    await sendWelcomeEmail(user);
    res.send({message: 'Email sent succesfully'})

  } catch (error) {
      next(error);
  }
}


export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  const {email} = req.body as Pick<User, 'email'>
  try {
    const user = await User.fetchOne({email});
    if(!user) {
      throw new RequestError('Email not found', 404);
    }
    await sendUpdatePasswordEmail(user);
    res.json({message: 'Email sent succesfully'});
  } catch (error) {
    next(error);
  }
}

export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
  const {token, password} = req.body as {token: string, password: string, confirmPassword: string};
  try {
    const user = await User.rawOne((query) => {
      return query.where('password_reset_token', token).andWhere('password_reset_expires', '>', new Date().toISOString()).select('*');
    })
  
    if(!user) {
      throw new RequestError('Token invalid or has expired', 400);
    }
    console.log(user);
    user.password = password;
    user.password_reset_expires = null;
    user.password_reset_token = null;
    await user.save('password', 'password_reset_token', 'password_reset_expires');

    res.json({message: 'Your password has been changed'});
  } catch (error) {
    next(error);
  }

}