import { test } from '@japa/runner';
import User from '#app/Models/User';
import UserFactory from '#database/factories/UserFactory';

test.group('Dashboard / Delete account page', () => {
  test('redirects to /user/login when accessing /user/delete as guest', async ({
    client,
  }) => {
    const response = await client.get('/user/delete');

    response.assertRedirectsTo('/user/login'); // Check if it redirects to the expected URL
  });

  test('returns a 200 opening the delete route while logged in', async ({
    client,
  }) => {
    const user = await UserFactory.create();
    const response = await client.get('/user/delete').loginAs(user);

    response.assertStatus(200);
    response.assertTextIncludes('Delete your account');
  });

  test('returns a 200 opening the delete route while logged in', async ({
    client,
    assert,
  }) => {
    const user = await UserFactory.create();
    const response = await client.post('/user/delete').loginAs(user);

    response.assertRedirectsTo('/user/login');
    // This asserts the session is deleted as well
    response.assertSessionMissing('auth_web');

    assert.isNull(await User.find(user.id));
  });
});
