import { test } from '@japa/runner';
import UserFactory from 'Database/factories/UserFactory';

test.group('Dashboard / Log out page', () => {
  test('returns a 401 opening the logout route as guest', async ({
    client,
  }) => {
    const response = await client.get('/user/logout');

    response.assertStatus(401);
  });

  test('logs the user out when opening the page', async ({ client }) => {
    const user = await UserFactory.create();
    const response = await client.get('/user/logout').loginAs(user);

    response.assertRedirectsTo('/user/login');
    // This asserts the session is deleted as well
    response.assertSessionMissing('auth_web');
  });
});
