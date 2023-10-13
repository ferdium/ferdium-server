import { DateTime } from 'luxon';
import { BaseModel, column, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm';
import User from './User';

export default class Service extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @hasOne(() => User, {
    foreignKey: 'userId',
  })
  public user: HasOne<typeof User>;

  @column({
    columnName: 'userId',
  })
  public userId: number;

  @column({
    columnName: 'serviceId',
  })
  public serviceId: string;

  @column()
  public name: string;

  @column({
    columnName: 'recipeId',
  })
  public recipeId: string;

  @column()
  public settings: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
