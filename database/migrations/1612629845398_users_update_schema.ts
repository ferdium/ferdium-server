import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
  public async up(): Promise<void> {
    this.schema.alterTable('users', table => {
      table.string('lastname', 80).notNullable().defaultTo('');
    });
  }

  public async down(): Promise<void> {
    this.schema.alterTable('users', table => {
      table.dropColumn('lastname');
    });
  }
}
