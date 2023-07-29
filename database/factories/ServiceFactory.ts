import Service from 'App/Models/Service';
import Factory from '@ioc:Adonis/Lucid/Factory';

export default Factory.define(Service, ({ faker }) => ({
  name: faker.company.name(),
  recipeId: faker.string.alphanumeric(9),
  serviceId: faker.string.alphanumeric(10),
})).build();
