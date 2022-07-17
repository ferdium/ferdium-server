import { test } from '@japa/runner';
import { UserFactory } from 'Database/factories';

test.group('Login page', () => {
  test('returns a 200 opening the login route', async ({ client }) => {
    const response = await client.get('/user/login');

    response.assertStatus(200);
  });

  test('returns `invalid mail or password` when validation fails', async ({
    client,
  }) => {
    const response = await client.post('/user/login').fields({
      mail: 'invalid',
      password: 'invalid',
    });

    response.assertRedirectsTo('/user/login');
    response.assertTextIncludes('Invalid mail or password');
  });

  test('returns `invalid mail or password` when account is not found', async ({
    client,
  }) => {
    const response = await client.post('/user/login').fields({
      mail: 'test+notexistingpassword@ferdium.org',
      password: 'notexistingpassword',
    });

    response.assertRedirectsTo('/user/login');
    response.assertTextIncludes('Invalid mail or password');
  });

  test('returns `invalid mail or password` when password is not valid', async ({
    client,
  }) => {
    await UserFactory.merge({
      email: 'test@ferdium.org',
    }).create();

    const response = await client.post('/user/login').fields({
      mail: 'test+invalid_password@ferdium.org',
      password: 'invalid_password',
    });

    response.assertRedirectsTo('/user/login');
    response.assertTextIncludes('Invalid mail or password');
  });

  test('redirects to account page when user is able to login', async ({
    client,
  }) => {
    await UserFactory.merge({
      email: 'test+password@ferdium.org',
    }).create();

    const response = await client.post('/user/login').fields({
      mail: 'test+password@ferdium.org',
      password: 'password',
    });

    response.assertRedirectsTo('/user/account');
  });
});
