import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
  protected tableName = 'workspaces';

  public async up(): Promise<void> {
    this.schema.createTable(this.tableName, table => {
      table.increments();
      table.string('workspaceId', 80).notNullable().unique();
      table.string('userId', 80).notNullable();
      table.string('name', 80).notNullable();
      table.integer('order');
      table.json('services');
      table.json('data');
      table.timestamps();
    });
  }

  public async down(): Promise<void> {
    this.schema.dropTable(this.tableName);
  }
}
