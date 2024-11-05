import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
  protected tableName = 'users';

  public async up(): Promise<void> {
    this.schema.createTable(this.tableName, table => {
      table.increments();
      table.string('username', 80).notNullable();
      table.string('email', 254).notNullable().unique();
      table.string('password', 60).notNullable();
      table.json('settings');
      table.timestamps();
    });
  }

  public async down(): Promise<void> {
    this.schema.dropTable(this.tableName);
  }
}
