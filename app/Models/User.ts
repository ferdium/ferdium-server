import { DateTime } from 'luxon';
import {
  BaseModel,
  beforeSave,
  column,
  HasMany,
  hasMany,
} from '@ioc:Adonis/Lucid/Orm';
import Hash from '@ioc:Adonis/Core/Hash';
import Event from '@ioc:Adonis/Core/Event';
import moment from 'moment';
import Encryption from '@ioc:Adonis/Core/Encryption';
import randtoken from 'rand-token';
import Token from './Token';
import Workspace from './Workspace';
import Service from './Service';
import Mail from '@ioc:Adonis/Addons/Mail';
import { url } from 'Config/app';
import { mailFrom } from 'Config/dashboard';

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public email: string;

  @column()
  public username: string;

  @column()
  public password: string;

  @column()
  public lastname: string;

  // TODO: Type the settings object.
  @column()
  public settings: object;

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime;

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password);
    }
  }

  @hasMany(() => Token, {
    foreignKey: 'user_id',
  })
  public tokens: HasMany<typeof Token>;

  @hasMany(() => Service, {
    foreignKey: 'userId',
  })
  public services: HasMany<typeof Service>;

  @hasMany(() => Workspace, {
    foreignKey: 'userId',
  })
  public workspaces: HasMany<typeof Workspace>;

  public async forgotPassword(): Promise<void> {
    const token = await this.generateToken(this, 'forgot_password');

    await Mail.send(message => {
      message
        .from(mailFrom)
        .to(this.email)
        .subject('[Ferdium] Password Recovery')
        .htmlView('emails/reset_password', {
          username: this.username,
          appUrl: url,
          token: token,
        });
    });

    await Event.emit('forgot:password', {
      user: this,
      token,
    });
  }

  private async generateToken(user: User, type: string): Promise<string> {
    const query = user
      .related('tokens')
      .query()
      .where('type', type)
      .where('is_revoked', false)
      .where(
        'updated_at',
        '>=',
        moment().subtract(24, 'hours').format('YYYY-MM-DD HH:mm:ss'),
      );

    const row = await query.first();
    if (row) {
      return row.token;
    }

    const token = Encryption.encrypt(randtoken.generate(16));

    await user.related('tokens').create({ type, token });

    return token;
  }
}
