import { test } from '@japa/runner';
import UserFactory from 'Database/factories/UserFactory';

test.group('Dashboard / Export page', () => {
  test('returns a 401 opening the export route as guest', async ({
    client,
  }) => {
    const response = await client.get('/user/transfer');

    response.assertStatus(401);
  });

  test('returns a correct export with user data', async ({
    assert,
    client,
  }) => {
    const user = await UserFactory.create();
    const response = await client.get('/user/export').loginAs(user);

    response.assertStatus(200);
    const exportData = JSON.parse(response.text());

    assert.equal(exportData.username, user.username);
    assert.equal(exportData.lastname, user.lastname);
    assert.equal(exportData.mail, user.email);
  });

  // TODO: We can improve this test by hard checking the export data
  test('returns a correct export with service data', async ({
    assert,
    client,
  }) => {
    const user = await UserFactory.with('services', 5).create();
    const response = await client.get('/user/export').loginAs(user);

    response.assertStatus(200);
    const exportData = JSON.parse(response.text());

    assert.equal(exportData.username, user.username);
    assert.equal(exportData.lastname, user.lastname);
    assert.equal(exportData.mail, user.email);
    assert.equal(exportData.services.length, user.services.length);
  });

  // TODO: We can improve this test by hard checking the export data
  test('returns a correct export with workspace data', async ({
    assert,
    client,
  }) => {
    const user = await UserFactory.with('workspaces', 5).create();
    const response = await client.get('/user/export').loginAs(user);

    response.assertStatus(200);
    const exportData = JSON.parse(response.text());

    assert.equal(exportData.username, user.username);
    assert.equal(exportData.lastname, user.lastname);
    assert.equal(exportData.mail, user.email);
    assert.equal(exportData.workspaces.length, user.workspaces.length);
  });
});
