import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'recipes'

  public async up(): Promise<void> {
    this.schema.createTable(this.tableName, (table) => {
      table.increments()
      table.string('name', 80).notNullable()
      table.string('recipeId', 254).notNullable().unique()
      table.json('data')
      table.timestamps()
    })
  }

  public async down(): Promise<void> {
    this.schema.dropTable(this.tableName)
  }
}
