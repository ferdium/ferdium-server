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

  @column()
  public serviceId: string;

  @column()
  public name: string;

  @column()
  public recipeId: string;

  // TODO: Type the settings object.
  @column()
  public settings: object;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
