import { BaseModel, beforeSave, column, hasMany, HasMany, HasManyThrough, hasManyThrough } from '@ioc:Adonis/Lucid/Orm'
import Hash from '@ioc:Adonis/Core/Hash'
import Token from './Token'
import Service from './Service'
import Workspace from './Workspace'
import { DateTime } from 'luxon'
import { RoleId } from 'App/types'
import Drive from '@ioc:Adonis/Core/Drive'
import { jsonColumn } from '@ioc:Adonis/Lucid/Json'
import Recipe from './Recipe'

export default class User extends BaseModel {
  // public static selfAssignPrimaryKey = true
  public static table = 'users'

  @column({ isPrimary: true })
  public id: number

  @column()
  public username: string

  @jsonColumn({ isArray: true })
  public roles: RoleId[]

  @column()
  public email: string

  @column()
  public name: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public rememberMeToken?: string

  @column()
  public picture?: string

  @column()
  public emailVerified: boolean

  @column()
  public blocked: boolean

  @column()
  public settings: string

  @column()
  public firstname: string

  @column()
  public lastname: string

  @column()
  public isVerified: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  /* @beforeCreate()
  public static assignUuid(user: User) {
    user.id = uuid()
  } */

  /**
   * A hook to hash the user password before saving
   * it to the database.
   */
  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.password) {
      // eslint-disable-next-line no-param-reassign
      user.password = await Hash.make(user.password)
    }
  }

  /**
   * A relationship on tokens is required for auth to
   * work. Since features like `refreshTokens` or
   * `rememberToken` will be saved inside the
   * tokens table.
   *
   * @method tokens
   *
   * @return {Object}
   */
  @hasMany(() => Token)
  public tokens: HasMany<typeof Token>

  @hasMany(() => Token, {
    onQuery: (query) => {
      query
        .where('name', 'password')
        .where('type', 'password')
        .where('is_revoked', false)
        .where('updated_at', '>=', DateTime.now().minus({ hours: 24 }).toFormat('YYYY-MM-DD HH:mm:ss'))
    },
  })
  public activePasswordTokens: HasMany<typeof Token>

  @hasMany(() => Service)
  public services: HasMany<typeof Service>

  @hasMany(() => Workspace)
  public workspaces: HasMany<typeof Workspace>

  @beforeSave()
  public static async cleanupPictureStorage (user: User) {
    if (user.$dirty.picture && user.$original.picture) {
      await Drive.use('cloudinary').delete(user.$original.picture)
    }
  }

  @beforeSave()
  public static async preventMultipleRootUsers (user: User) {
    const rootUser = await User.findBy('roles', ['root'])
    if (rootUser && user.roles.includes('root') && user.id !== rootUser.id) {
      throw new Error('Only one root user is allowed. Abort saving')
    }
  }
}
