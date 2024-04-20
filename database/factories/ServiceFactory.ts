import Service from '#app/Models/Service';
import Factory from '@adonisjs/lucid/factories';

export default Factory.define(Service, ({ faker }) => ({
  name: faker.company.name(),
  recipeId: faker.string.alphanumeric(9),
  serviceId: faker.string.alphanumeric(10),
})).build();
