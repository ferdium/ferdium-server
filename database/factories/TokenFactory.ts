import Token from '#app/Models/Token'
import Factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'

export default Factory.define(Token, async ({ faker }) => ({
  token: faker.string.alphanumeric(32),
  type: 'forgot_password',
  is_revoked: false,
  created_at: DateTime.now(),
  updated_at: DateTime.now(),
}))
  .state('old_token', (token) => (token.updated_at = DateTime.now().minus({ hours: 25 })))
  .state('revoked', (token) => (token.is_revoked = true))
  .build()
