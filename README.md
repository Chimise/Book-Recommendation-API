# Book Recommendation App

This is a Node.js Express application for searching different books by title, author, subject using Open Library API, saving favorite books to personal library and adding rating and review to favorite books.

One of it's major features is recommending books to users based on their previous ratings by relying on ratings of other users for similar books and computing a similariy index between the users using a variation of Jaccard index formula and recommending books based on this similariy index.

# Table of contents:

- [Pre-reqs](#pre-reqs)
- [Getting started](#getting-started)
- [Project Structure](#project-structure)
- [Dependencies](#dependencies)
	- [`dependencies`](#dependencies)
	- [`devDependencies`](#devdependencies)


# Pre-reqs
To build and run this app locally you will need a few things:
- Install [Node.js](https://nodejs.org/en/)
- Install [PostgreSQL](https://www.postgresql.org/download/)
- Install [VS Code](https://code.visualstudio.com/)


# Getting started
- Clone the repository
```
git clone --depth=1 https://github.com/Chimise/Book-Recommendation-App.git <project_name>
```
- Install dependencies
```
cd <project_name>
npm install
```
- Install Knex Migration CLI
```bash
# install knex migration cli
npm install knex -g
```

- Create a User and a Database
```bash
# Change user to postgres
sudo -u postgres psql
# Create Database 
CREATE DATABASE <mydb>;
# Create User
CREATE USER <myUser> WITH ENCRYPTED PASSWORD <'mypass'>;
# Grant Database Access to User
GRANT ALL PRIVILEGES ON DATABASE <mydb> TO <myUser>;
```

- Build and run the project
```bash
# Emit Javascript files from the Typescript source file
npm run build
# Run knex migration files
knex migrate:run --knexfile ./dist/util/knexFile.js
# Start the server
npm start
```

# Project Structure

The full folder structure of this app is explained below:

| Name | Description |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| **dist**                 | Contains the Javascript files emitted from Typescript, this is the code that will be deployed|
| **node_modules**         | Contains all your npm dependencies                                                            |
| **knex**         | Contains migrations and seeds                                                            |
| **knex/migrations**         | Contains knex migrations  files                                                            |
| **src**                  | Contains your source code that will be compiled to the dist dir                               |
| **src/config**           | Contains enviroment and logging configurations for the project   |
| **src/controllers**      | Controllers define functions that respond to various http requests                            |
| **src/interfaces**            | Contains Model Schemas and other types used in the application          |
| **src/middlewares**            | Contains authentication and validation middlewares to process request before they are handled by the controller         |
| **src/models**           | Models define database schema that will be used in storing and retrieving data from Postgresql  |
| **src/routes**            | Contains files mapping routes to controllers         |
| **src/services**            | Contains files that handle specific logics and used in the controller        |
| **src/util**            | Utility files for sending emails and adding specific functionalities to the app        |
| **src/validators**            | Yup schema object validators       |
| **src**/server.ts        | Entry point to your express app                                                               |
| **templates**        | Email Html Templates                                                        |
| .env.example             | API keys, tokens, passwords, database URI. Clone this, but don't check it in to public repos. |
| package.json             | File that contains npm dependencies as well as [build scripts]                    |
| tsconfig.json            | Config settings for compiling server code written in TypeScript                               |


# Dependencies
Dependencies are managed through `package.json`.
In that file you'll find two sections:

## `dependencies`

| Package                         | Description                                                           |
| ------------------------------- | --------------------------------------------------------------------- |
| bcryptjs                   | Library for hashing and salting user passwords.                       |
| body-parser                     | Express 4 middleware.                                                 |
| cors                    | Express 4 middleware.                                                 |
| dotenv                          | Loads environment variables from .env file.                            |
| express                         | Node.js web framework.                                                |
| yup         |   Schema validation library                                  |
| lodash                          | General utility library.                                              |
| nodemailer                      | Node.js library for sending emails.                                   |
| jsonwebtoken         | Json Web token Library |
| winston            | Logging library                |
| pg            | Node.js Postgresql native driver                |
| knex            | SQL query builder                |
| node-fetch            | Fetch API Implementation for Node.js                |

## `devDependencies`

| Package                         | Description                                                            |
| ------------------------------- | ---------------------------------------------------------------------- |
| @types                          | Dependencies in this folder are `.d.ts` files used to provide types    |
| concurrently                    | Utility that manages multiple concurrent tasks. Used with npm scripts  |
| nodemon                         | Utility that automatically restarts node process when it crashes       |
| typescript                      | JavaScript compiler/type checker that boosts JavaScript productivity   |

To install or update these dependencies you can use `npm install` or `npm update`.





