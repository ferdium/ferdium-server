import User from 'App/Models/User';
import Factory from '@ioc:Adonis/Lucid/Factory';
import WorkspaceFactory from './WorkspaceFactory';
import ServiceFactory from './ServiceFactory';

export default Factory.define(User, async ({ faker }) => ({
  email: faker.internet.email(),
  username: faker.internet.userName(),
  password: 'password',
  // eslint-disable-next-line unicorn/prefer-string-replace-all
  lastname: faker.person.lastName().replace(/'/g, ''),
}))
  .relation('workspaces', () => WorkspaceFactory)
  .relation('services', () => ServiceFactory)
  .build();
