import { BaseSchema } from '@adonisjs/lucid/schema';

export default class JwtTokens extends BaseSchema {
  protected tableName = 'jwt_tokens';

  public async up() {
    this.schema.createTable(this.tableName, table => {
      table.increments('id').primary();
      table
        .integer('user_id')
        .unsigned()
        .references('users.id')
        .onDelete('CASCADE');
      table.string('name').notNullable();
      table.string('type').notNullable();
      table.string('token', 64).notNullable().unique();
      table.timestamp('expires_at', { useTz: true }).nullable();
      table.string('refresh_token').notNullable().unique().index();
      table
        .timestamp('refresh_token_expires_at', { useTz: true })
        .notNullable();
      table.timestamp('created_at', { useTz: true }).notNullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
