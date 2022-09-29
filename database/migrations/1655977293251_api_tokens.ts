import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ApiTokens extends BaseSchema {
  protected tableName = 'tokens'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      table
        .integer('user_id')
        .unsigned()
        .references('users.id')
        .onDelete('CASCADE')
        .alter()
      table.string('name').notNullable()
      table.string('type').notNullable().alter()
      table.string('token', 64).notNullable().alter()

      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('expires_at', { useTz: true }).nullable()

      table.timestamp('created_at', { useTz: true }).notNullable().alter()
      table.timestamp('updated_at', { useTz: true }).notNullable().alter()
    })
  }

  public async down () {
    this.schema.table(this.tableName, (table) => {
      table.integer('user_id').references('users.id').alter()

      table.dropColumn('name')
      table.string('type', 80).notNullable().alter()
      table.string('token', 255).notNullable().alter()

      table.dropColumn('expires_at')
      table.timestamp('created_at').notNullable().alter()
      table.timestamp('updated_at').notNullable().alter()
    })
  }
}
