import {readFile} from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import nodemailer, {SendMailOptions} from 'nodemailer';
import _ from 'lodash';
import logger from '../config/logger';
import RequestError from '../util/RequestError';

const MAIL_USERNAME = process.env.MAIL_USERNAME;
const MAIL_PASSWORD = process.env.MAIL_PASSWORD;

if(!MAIL_PASSWORD || !MAIL_USERNAME) {
    logger.debug('MAIL_USERNAME OR MAIL_PASSWORD env variable is not avialable');
    process.exit(1);
}


const transporter = nodemailer.createTransport(
    {
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    },
    {
      from: "noreply@surveymailer.com",
    }
);


type TemplateOptions = {
    templatePath: string;
    variables: object;
}


 
export const sendTemplatedEmail = async ({templatePath, variables}: TemplateOptions, options: Omit<SendMailOptions, 'html'>) => {
    const filePath = path.join('templates', `${templatePath}.html`);
    if(!existsSync(filePath)) {
      logger.info('email template not found', filePath);
      throw new RequestError('An error occured', 500);
    }
    const file = await readFile(filePath, 'utf-8');
    const emailHtml = _.template(file)(variables);
    const response = await transporter.sendMail({
        html: emailHtml,
        ...options
    });
    return response;
}
