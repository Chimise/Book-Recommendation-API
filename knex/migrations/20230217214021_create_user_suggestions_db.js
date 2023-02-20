/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('user_suggestions', table => {
    table.increments('id');
    table.integer('book_id').references('books.id').onDelete('CASCADE').onUpdate('CASCADE');
    table.integer('user_id').references('users.id').onDelete('CASCADE').onUpdate('CASCADE');
    table.double('weight').defaultTo(0);
    table.timestamps(false, true);
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('user_suggestions');
};
