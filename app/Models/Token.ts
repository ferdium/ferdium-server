import { DateTime } from 'luxon';
import { BaseModel, column, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm';
import User from './User';

export default class Token extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @hasOne(() => User, {
    localKey: 'user_id',
    foreignKey: 'id',
  })
  public user: HasOne<typeof User>;

  @column()
  public user_id: number;

  @column()
  public token: string;

  @column()
  public type: string;

  @column()
  public is_revoked: boolean;

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime;
}
