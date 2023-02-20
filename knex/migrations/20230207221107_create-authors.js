/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('authors', (table) => {
    table.increments('id');
    table.string('name', 1000).notNullable();
    table.text('bio');
    table.string('identifier', 20).notNullable().unique();
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('authors');
};
