import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'workspaces'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('icon_url').nullable()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('icon_url')
    })
  }
}
