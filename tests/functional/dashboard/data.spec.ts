import { test } from '@japa/runner';
import UserFactory from 'Database/factories/UserFactory';

test.group('Dashboard / Data page', () => {
  test('redirects to /user/login when accessing /user/data as guest', async ({
    client,
  }) => {
    const response = await client.get('/user/data');

    response.assertRedirectsTo('/user/login'); // Check if it redirects to the expected URL
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

  test('handles concurrent requests without exhausting the database connection pool', async ({
    client,
  }) => {
    const user = await UserFactory.with('services', 10)
      .with('workspaces', 10)
      .create();
    const responses = await Promise.all(
      Array.from({ length: 25 }, () => client.get('/user/data').loginAs(user)),
    );

    for (const response of responses) {
      response.assertStatus(200);
      response.assertTextIncludes(user.email);
    }
  });

  // TODO: Add test to include services.
  // TODO: Add test to include workspaces.
});
