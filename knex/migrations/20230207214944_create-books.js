/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('books', table => {
    table.increments('id');
    table.string('title', 1000).notNullable();
    table.text('description')
    table.date('publication_date').notNullable();
    table.text('cover_image').notNullable();
    table.string('identifier', 20).notNullable().unique();
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('books');
};
