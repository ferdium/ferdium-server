// @ts-ignore
import Token from 'App/Models/Token';
import Factory from '@ioc:Adonis/Lucid/Factory';
import { DateTime } from 'luxon';

export default Factory.define(Token, async ({ faker }) => ({
  token: faker.random.alphaNumeric(32),
  type: 'forgot_password',
  is_revoked: false,
  created_at: DateTime.now(),
  updated_at: DateTime.now(),
}))
  .state(
    'old_token',
    token => (token.updated_at = DateTime.now().minus({ hours: 25 })),
  )
  .state('revoked', token => (token.is_revoked = true))
  .build();
