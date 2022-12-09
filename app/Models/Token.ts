import { DateTime } from 'luxon';
import { BaseModel, column, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm';
import User from './User';

export default class Token extends BaseModel {
  @column({ isPrimary: true })
  // @ts-ignore
  public id: number;

  @hasOne(() => User, {
    localKey: 'user_id',
    foreignKey: 'id',
  })
  // @ts-ignore
  public user: HasOne<typeof User>;

  @column()
  // @ts-ignore
  public user_id: number;

  @column()
  // @ts-ignore
  public token: string;

  @column()
  // @ts-ignore
  public type: string;

  @column()
  // @ts-ignore
  public is_revoked: boolean;

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime;
}
