/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('books', (table) => {
      table.dropColumn('publication_date');
      table.smallint('publication_year').notNullable();
    })
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.table('books', (table) => {
     table.dropColumn('publication_year');
     table.date('publication_date').notNullable();
    })
  };
  