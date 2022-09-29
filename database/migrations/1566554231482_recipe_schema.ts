import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class RecipeSchema extends BaseSchema {
  protected tableName = 'recipes'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments()
      table.string('name', 80).notNullable()
      table.uuid('recipe_id').notNullable().unique()
      table.json('data')

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public pdown () {
    this.schema.dropTable(this.tableName)
  }
}
