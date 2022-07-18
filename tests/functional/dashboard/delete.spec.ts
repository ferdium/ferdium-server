import { test } from '@japa/runner';
import User from 'App/Models/User';
import { UserFactory } from 'Database/factories';

test.group('Dashboard / Delete account page', () => {
  test('returns a 401 opening the delete route as guest', async ({
    client,
  }) => {
    const response = await client.get('/user/delete');

    response.assertStatus(401);
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
