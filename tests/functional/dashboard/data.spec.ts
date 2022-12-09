import { test } from '@japa/runner';
// @ts-ignore
import UserFactory from 'Database/factories/UserFactory';

test.group('Dashboard / Data page', () => {
  test('returns a 401 opening the data route as guest', async ({ client }) => {
    const response = await client.get('/user/data');

    response.assertStatus(401);
  });

  test('ensure the correct data is shown on the page', async ({ client }) => {
    const user = await UserFactory.create();
    const response = await client.get('/user/data').loginAs(user);

    response.assertStatus(200);
    response.assertTextIncludes(user.email);
    response.assertTextIncludes(user.username);
    response.assertTextIncludes(user.lastname);
    response.assertTextIncludes(
      user.created_at.toFormat('yyyy-MM-dd HH:mm:ss'),
    );
    response.assertTextIncludes(
      user.updated_at.toFormat('yyyy-MM-dd HH:mm:ss'),
    );
  });

  // TODO: Add test to include services.
  // TODO: Add test to include workspaces.
});
