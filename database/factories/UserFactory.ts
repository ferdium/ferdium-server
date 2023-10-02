import User from 'App/Models/User';
import Factory from '@ioc:Adonis/Lucid/Factory';
import WorkspaceFactory from './WorkspaceFactory';
import ServiceFactory from './ServiceFactory';
import crypto from 'node:crypto';

const hashedPassword = crypto
  .createHash('sha256')
  .update('password')
  .digest('base64');

export default Factory.define(User, async ({ faker }) => ({
  email: faker.internet.email(),
  username: faker.internet.userName(),
  password: hashedPassword,
  // eslint-disable-next-line unicorn/prefer-string-replace-all
  lastname: faker.person.lastName().replace(/'/g, ''),
}))
  .relation('workspaces', () => WorkspaceFactory)
  .relation('services', () => ServiceFactory)
  .build();
