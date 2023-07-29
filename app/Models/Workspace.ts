import { DateTime } from 'luxon';
import { BaseModel, column, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm';
import User from './User';

export default class Workspace extends BaseModel {
  @column({ isPrimary: true })
  // @ts-ignore
  public id: number;

  @column({
    columnName: 'workspaceId',
  })
  // @ts-ignore
  public workspaceId: string;

  @hasOne(() => User, {
    foreignKey: 'userId',
  })
  // @ts-ignore
  public user: HasOne<typeof User>;

  @column({
    columnName: 'userId',
  })
  // @ts-ignore
  public userId: number;

  @column()
  // @ts-ignore
  public name: string;

  @column()
  // @ts-ignore
  public order: number;

  @column()
  // @ts-ignore
  public services: string;

  @column()
  // @ts-ignore
  public data: string;

  // @ts-ignore
  @column.dateTime({ autoCreate: true })
  // @ts-ignore
  public createdAt: DateTime;

  // @ts-ignore
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  // @ts-ignore
  public updatedAt: DateTime;
}
