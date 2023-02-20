/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('users_similarity', table => {
    table.increments('id');
    table.integer('current_user_id').notNullable().references('users.id').onDelete('CASCADE').onUpdate('CASCADE');
    table.integer('other_user_id').notNullable().references('users.id').onDelete('CASCADE').onUpdate('CASCADE');
    table.double('similarity_index').defaultTo(0);
    table.timestamps(false, true);

  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('users_similarity');
};
