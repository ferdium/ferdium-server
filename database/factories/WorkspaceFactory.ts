import Workspace from 'App/Models/Workspace';
import Factory from '@ioc:Adonis/Lucid/Factory';

export default Factory.define(Workspace, ({ faker }) => ({
  name: faker.internet.userName(),
  workspaceId: faker.random.alphaNumeric(10),
})).build();
