import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
  protected tableName = 'tokens';

  public up() {
    this.schema.alterTable(this.tableName, table => {
      table.string('name');
      table.datetime('expires_at');
    });
  }
}