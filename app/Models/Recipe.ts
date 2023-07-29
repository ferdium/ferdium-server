import { DateTime } from 'luxon';
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm';

export default class Recipe extends BaseModel {
  @column({ isPrimary: true })
  // @ts-ignore
  public id: number;

  @column()
  // @ts-ignore
  public name: string;

  @column()
  // @ts-ignore
  public recipeId: string;

  // TODO: Type the data object.
  @column()
  // @ts-ignore
  public data: object;

  // @ts-ignore
  @column.dateTime({ autoCreate: true })
  // @ts-ignore
  public createdAt: DateTime;

  // @ts-ignore
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  // @ts-ignore
  public updatedAt: DateTime;
}
