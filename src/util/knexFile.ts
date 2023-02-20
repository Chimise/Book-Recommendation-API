import { POSTGRES_URI } from "../config/secrets";

export default {
  client: "pg",
  connection: POSTGRES_URI,
  migrations: {
    directory: "../../knex/migrations",
  },
  seeds: {
    directory: "../../knex/seeds",
  },
};
