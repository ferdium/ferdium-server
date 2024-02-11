import User from '#app/Models/User'
import Factory from '@adonisjs/lucid/factories'
import WorkspaceFactory from './WorkspaceFactory.js'
import ServiceFactory from './ServiceFactory.js'
import crypto from 'node:crypto'

const hashedPassword = crypto.createHash('sha256').update('password').digest('base64')

export default Factory.define(User, async ({ faker }) => ({
  email: faker.internet.email(),
  username: faker.internet.userName(),
  password: hashedPassword,
  // eslint-disable-next-line unicorn/prefer-string-replace-all
  lastname: faker.person.lastName().replace(/'/g, ''),
}))
  .relation('workspaces', () => WorkspaceFactory)
  .relation('services', () => ServiceFactory)
  .build()
