import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
  protected tableName = 'tokens';

  public async up(): Promise<void> {
    this.schema.createTable(this.tableName, table => {
      table.increments();
      table.integer('user_id').unsigned().references('id').inTable('users');
      table.string('token', 255).notNullable().unique().index();
      table.string('type', 80).notNullable();
      table.boolean('is_revoked').defaultTo(false);
      table.timestamps();
    });
  }

  public async down(): Promise<void> {
    this.schema.dropTable(this.tableName);
  }
}
