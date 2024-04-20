import Workspace from '#app/Models/Workspace';
import Factory from '@adonisjs/lucid/factories';

export default Factory.define(Workspace, ({ faker }) => ({
  name: faker.internet.userName(),
  workspaceId: faker.string.alphanumeric(10),
})).build();
