/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('book_authors', table => {
    table.increments('id');
      table.timestamps(false, true);
    })
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.table('book_authors', table => {
        table.dropPrimary('id_pkey').dropColumn('id');
      table.dropTimestamps();
    })
  };
  