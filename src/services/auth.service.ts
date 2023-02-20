import crypto from "crypto";
import { sendTemplatedEmail } from "./email.service";
import { generateAuthToken } from "./jwt.service";
import logger from "../config/logger";
import User from "../models/User.model";
import RequestError from "../util/RequestError";

const server_url = process.env.SERVER_URL;
const frontend_url = process.env.FRONTEND_PASSWORD_RESET_URL;

if (!server_url) {
  logger.info("SERVER_URL env variable not set");
  throw new RequestError("An error occurred", 500);
}

export const sendWelcomeEmail = async (user: User) => {
  const token = generateAuthToken(user, { expiresIn: "1d" }, true);
  const redirect_url = `${server_url}/auth/verify-email?code=${encodeURIComponent(
    token
  )}`;
  const response = await sendTemplatedEmail(
    {
      templatePath: "welcome_email",
      variables: {
        user,
        server_url,
        redirect_url,
      },
    },
    {
      from: "Bookreviewer <noreply@bookreviewer.com>",
      to: user.email,
      subject: "Verify your account on Bookreviewer",
      text: `Hello, ${user.full_name}\n\n, 
        Thank you for signing up with Bookreviewer\n\n
        Please click the link below to activate your account\n\n
        ${redirect_url}\n\n
        Regards\n\n
        Bookreviewer Team\n
        `,
    }
  );
  return response;
};

export const sendUpdatePasswordEmail = async (user: User) => {
  if (!frontend_url) {
    logger.info("FRONTEND_URL env variable not set");
    throw new RequestError("An error occured", 500);
  }
  const token = crypto.randomBytes(32).toString("hex");
  // The token expires in five minutes
  const expiresIn = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const redirect_url = `${frontend_url}?token=${token}`;
  const response = await sendTemplatedEmail(
    {
      templatePath: "reset_password",
      variables: {
        user,
        redirect_url,
        server_url,
      },
    },
    {
      to: user.email,
      from: "Bookreviewer <noreply@bookreviewer.com>",
      subject: "Reset your password on Bookreviewer",
      text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        ${redirect_url}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    }
  );

  user.password_reset_expires = expiresIn;
  user.password_reset_token = token;
  await user.save();
  return response;
};

export const sendUpdatePasswordSuccessEmail = async (user: User) => {
  return sendTemplatedEmail(
    {
      templatePath: "reset_password_success",
      variables: {
        user,
        server_url,
      },
    },
    {
      from: "Bookreviewer <noreply@bookreviewer.com>",
      to: user.email,
      text: `Hello, ${user.full_name}\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`,
    }
  );
};
