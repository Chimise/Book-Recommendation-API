/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('user_books', table => {
    table.increments('id')
    table.enu('rating', [0, 1, 2, 3, 4, 5], {useNative: true}).defaultTo(0);
    table.text('review');
    table.integer('book_id').references('books.id').onUpdate('CASCADE').onDelete('CASCADE');
    table.integer('user_id').references('users.id').onUpdate('CASCADE').onDelete('CASCADE');
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('user_books');
};
