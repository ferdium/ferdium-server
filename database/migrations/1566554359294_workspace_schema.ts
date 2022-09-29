import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class WorkspaceSchema extends BaseSchema {
  protected tableName = 'workspaces'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments()
      table.uuid('workspace_id').notNullable().unique()
      table.integer('user_id').unsigned().notNullable().references('users.id')
      table.string('name', 80).notNullable()
      table.integer('order')
      table.json('services')
      table.json('data')

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public down () {
    this.schema.dropTable('workspaces')
  }
}
