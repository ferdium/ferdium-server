import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UsersSchema extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      table.string('remember_me_token').nullable()
      table.string('firstname', 80).notNullable().defaultTo('')

      table.string('email', 255).notNullable().alter()
      table.string('password', 180).notNullable().alter()

      table.json('roles').notNullable()
      table.text('picture')
      table.boolean('blocked').notNullable()
      table.boolean('email_verified').notNullable()

      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).notNullable().alter()
      table.timestamp('updated_at', { useTz: true }).notNullable().alter()
    })
  }

  public async down () {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('remember_me_token')
      table.dropColumn('firstname')

      table.string('email', 254).notNullable().alter()
      table.string('password', 60).notNullable().alter()

      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at').notNullable().alter()
      table.timestamp('updated_at').notNullable().alter()
    })
  }
}
