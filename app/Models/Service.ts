import { DateTime } from 'luxon';
import { BaseModel, column, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm';
import User from './User';

export default class Service extends BaseModel {
  @column({ isPrimary: true })
  // @ts-ignore
  public id: number;

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

  @column({
    columnName: 'serviceId',
  })
  // @ts-ignore
  public serviceId: string;

  @column()
  // @ts-ignore
  public name: string;

  @column({
    columnName: 'recipeId',
  })
  // @ts-ignore
  public recipeId: string;

  @column()
  // @ts-ignore
  public settings: string;

  // @ts-ignore
  @column.dateTime({ autoCreate: true })
  // @ts-ignore
  public createdAt: DateTime;

  // @ts-ignore
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  // @ts-ignore
  public updatedAt: DateTime;
}
