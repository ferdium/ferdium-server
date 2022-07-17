import Factory from '@ioc:Adonis/Lucid/Factory';
import Hash from '@ioc:Adonis/Core/Hash';
import User from 'App/Models/User';

export const UserFactory = Factory.define(User, async ({ faker }) => ({
  email: faker.internet.email(),
  username: faker.internet.userName(),
  password: 'password',
  lastname: faker.name.lastName(),
})).build();
