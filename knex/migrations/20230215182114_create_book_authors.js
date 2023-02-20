/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('book_authors', (table) => {
    table.integer('book_id').references('books.id').onDelete('CASCADE').onUpdate('CASCADE');
    table.integer('author_id').references('authors.id').onDelete('CASCADE').onUpdate('CASCADE');
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('book_authors');
};
