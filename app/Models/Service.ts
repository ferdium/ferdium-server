import { jsonColumn } from '@ioc:Adonis/Lucid/Json'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'
import Recipe from './Recipe'
import User from './User'

export default class Service extends BaseModel {
  // public static selfAssignPrimaryKey = true;

  @column({ isPrimary: true })
  public id: string

  @column()
  public userId: number

  @column()
  public serviceId: string

  @column()
  public name: string

  @column()
  public recipeId: string

  @jsonColumn()
  public settings: any

  // @column({
  //   serialize: (value: any) => JSON.stringify(value),
  //   prepare: (value: any) => JSON.stringify(value),
  //   consume: (value: any) => JSON.parse(value)
  // })
  // public settings: object;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  /*   @beforeCreate()
  public static assignUuid(service: Service) {
    service.id = uuid();
  } */

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => Recipe, {
    localKey: 'recipeId',
    foreignKey: 'recipeId',
  })
  public recipe: BelongsTo<typeof Recipe>
}
