/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class UsersUpdateSchema extends Schema {
  up() {
    this.table('users', (table) => {
      table.string('lastname', 80).notNullable().default('');
    });
  }

  down() {
    this.table('users', (table) => {
      table.dropColumn('lastname');
    });
  }
}

module.exports = UsersUpdateSchema;
