import { DateTime } from 'luxon';
import { BaseModel, column, hasOne } from '@adonisjs/lucid/orm';
import User from './User.js';
import type { HasOne } from '@adonisjs/lucid/types/relations';

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
