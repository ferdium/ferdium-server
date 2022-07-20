import Service from 'App/Models/Service';
import Factory from '@ioc:Adonis/Lucid/Factory';

export default Factory.define(Service, ({ faker }) => ({
  name: faker.company.companyName(),
  recipeId: faker.random.alphaNumeric(9),
  serviceId: faker.random.alphaNumeric(10),
})).build();
