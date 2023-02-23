/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("user_books", (builder) => {
    builder.integer("rating").defaultTo(0).checkIn([0, 1, 2, 3, 4, 5]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("user_books", (builder) => {
    builder.dropChecks("rating_check");
    builder.dropColumn("rating");
  });
};
