import logger from "./logger";
import dotenv from "dotenv";
import path from 'path';


dotenv.config({path: process.cwd().includes('/util') ? path.resolve('../../.env') : '.env'});

export const ENVIRONMENT = process.env.NODE_ENV;
const prod = ENVIRONMENT === "production"; // Anything else is treated as 'dev'

export const JWT_SECRET = process.env["JWT_SECRET"];
export const JWT_REFRESH_SECRET = process.env['JWT_REFRESH_SECRET'];
export const POSTGRES_URI = prod ? process.env["POSTGRES_URI"] : process.env["POSTGRES_URI_LOCAL"];

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
    logger.error("No JWT_SECRET environment variable found.");
    process.exit(1);
}

if (!POSTGRES_URI) {
    if (prod) {
        logger.error("No postgres connection string. Set POSTGRES_URI environment variable.");
    } else {
        logger.error("No postgres connection string. Set POSTGRES_URI_LOCAL environment variable.");
    }
    process.exit(1);
}


