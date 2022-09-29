import { jsonColumn } from '@ioc:Adonis/Lucid/Json'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'
import User from './User'

export default class Workspace extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public workspaceId: string

  @column()
  public userId: number

  @column()
  public name: string

  @column()
  public order: number

  @jsonColumn()
  public data: any

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @jsonColumn({ isArray: true })
  public services: string[]

  /**
   * User that has the workspace
   */
  @belongsTo(() => User)
  public user: BelongsTo<typeof User>
}
