import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UsersUpdateSchema extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      table.string('lastname', 80).notNullable().defaultTo('')
    })
  }

  public async down () {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('lastname')
    })
  }
}
