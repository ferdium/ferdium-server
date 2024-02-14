import { DateTime } from 'luxon';
import { BaseModel, column, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm';
import User from './User';

export default class Workspace extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column({
    columnName: 'workspaceId',
  })
  public workspaceId: string;

  @hasOne(() => User, {
    foreignKey: 'userId',
  })
  public user: HasOne<typeof User>;

  @column({
    columnName: 'userId',
  })
  public userId: number;

  @column()
  public name: string;

  @column()
  public order: number;

  @column()
  public services: string;

  @column()
  public data: string; // JSON string that match type CustomData

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}

export interface CustomData {
  name?: string;
  iconUrl?: string;
}
