import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
  protected tableName = 'tokens';

  public async up(): Promise<void> {
    await this.db.rawQuery(
      'DELETE FROM tokens WHERE user_id NOT IN (SELECT id FROM users)',
    );

    this.schema.alterTable(this.tableName, table => {
      table.dropForeign('user_id');

      table.foreign('user_id').references('users.id').onDelete('cascade');
    });
  }

  public async down(): Promise<void> {
    // Don't set it back withouth onDelete as the
    // tests will break.
  }
}
