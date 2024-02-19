import { test } from '@japa/runner';
import UserFactory from '#database/factories/UserFactory';

test.group('Dashboard / Log out page', () => {
  test('redirects to /user/login when accessing /user/logout as guest', async ({
    client,
  }) => {
    const response = await client.get('/user/logout');

    response.assertRedirectsTo('/user/login'); // Check if it redirects to the expected URL
  });

  test('logs the user out when opening the page', async ({ client }) => {
    const user = await UserFactory.create();
    const response = await client.get('/user/logout').loginAs(user);

    response.assertRedirectsTo('/user/login');
    // This asserts the session is deleted as well
    response.assertSessionMissing('auth_web');
  });
});
