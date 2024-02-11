import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'services'

  public async up(): Promise<void> {
    this.schema.createTable(this.tableName, (table) => {
      table.increments()
      table.string('userId', 80).notNullable()
      table.string('serviceId', 80).notNullable()
      table.string('name', 80).notNullable()
      table.string('recipeId', 254).notNullable()
      table.json('settings')
      table.timestamps()
    })
  }

  public async down(): Promise<void> {
    this.schema.dropTable(this.tableName)
  }
}
