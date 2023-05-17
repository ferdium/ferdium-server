import { test } from '@japa/runner';
import UserFactory from 'Database/factories/UserFactory';

test.group('Dashboard / Transfer page', () => {
  test('returns a 401 opening the transfer route as guest', async ({
    client,
  }) => {
    const response = await client.get('/user/transfer');

    response.assertStatus(401);
  });

  test('returns a 200 opening the transfer route while being logged in', async ({
    client,
  }) => {
    const user = await UserFactory.create();
    const response = await client.get('/user/transfer').loginAs(user);

    response.assertStatus(200);
  });

  test('returns a validation error when not uploading a file', async ({
    client,
  }) => {
    const user = await UserFactory.create();
    const response = await client.put('/user/transfer').loginAs(user);

    response.assertTextIncludes('File missing');
  });

  test('returns a validation error when trying to use anything but json', async ({
    client,
  }) => {
    const user = await UserFactory.create();
    const response = await client
      .put('/user/transfer')
      .loginAs(user)
      .file('file', 'tests/functional/dashboard/import-stubs/random-file.txt', {
        filename: 'random-file.txt',
      });

    response.assertTextIncludes('File missing');
  });

  test('returns a validation error when trying to use anything valid json', async ({
    client,
  }) => {
    const user = await UserFactory.create();
    const response = await client
      .put('/user/transfer')
      .loginAs(user)
      .file('file', 'tests/functional/dashboard/import-stubs/invalid.json', {
        filename: 'invalid.json',
      });

    response.assertTextIncludes('Invalid Ferdium account file');
  });

  test('returns a validation error when trying to use a json file with no ferdium structure', async ({
    client,
  }) => {
    const user = await UserFactory.create();
    const response = await client
      .put('/user/transfer')
      .loginAs(user)
      .file(
        'file',
        'tests/functional/dashboard/import-stubs/valid-no-data.json',
        {
          filename: 'valid-no-data.json',
        },
      );

    response.assertTextIncludes('Invalid Ferdium account file (2)');
  });

  test('correctly transfers data from json/ferdi-data and ferdium-data file with only workspaces', async ({
    client,
    assert,
  }) => {
    // Repeat for all 3 file extension
    const files = [
      'workspaces-only.json',
      'workspaces-only.ferdi-data',
      'workspaces-only.ferdium-data',
    ];

    for (const file of files) {
      const user = await UserFactory.create();
      const response = await client
        .put('/user/transfer')
        .loginAs(user)
        .file('file', 'tests/functional/dashboard/import-stubs/' + file, {
          filename: file,
        });

      response.assertTextIncludes(
        'Your account has been imported, you can now login as usual!',
      );
      await user.refresh();

      const workspacesForUser = await user.related('workspaces').query();
      assert.equal(workspacesForUser.length, 3);
    }
  });

  test('correctly transfers data from json/ferdi-data and ferdium-data file with only services', async ({
    client,
    assert,
  }) => {
    // Repeat for all 3 file extension
    const files = [
      'services-only.json',
      'services-only.ferdi-data',
      'services-only.ferdium-data',
    ];

    for (const file of files) {
      const user = await UserFactory.create();
      const response = await client
        .put('/user/transfer')
        .loginAs(user)
        .file('file', 'tests/functional/dashboard/import-stubs/' + file, {
          filename: file,
        });

      response.assertTextIncludes(
        'Your account has been imported, you can now login as usual!',
      );
      await user.refresh();

      const servicesForUser = await user.related('services').query();
      assert.equal(servicesForUser.length, 3);
    }
  });

  test('correctly transfers data from json/ferdi-data and ferdium-data file with workspaces and services', async ({
    client,
    assert,
  }) => {
    // Repeat for all 3 file extension
    const files = [
      'services-workspaces.json',
      'services-workspaces.ferdi-data',
      'services-workspaces.ferdium-data',
    ];

    for (const file of files) {
      const user = await UserFactory.create();
      const response = await client
        .put('/user/transfer')
        .loginAs(user)
        .file('file', 'tests/functional/dashboard/import-stubs/' + file, {
          filename: file,
        });

      response.assertTextIncludes(
        'Your account has been imported, you can now login as usual!',
      );
      await user.refresh();

      const servicesForUser = await user.related('services').query();
      const workspacesForUser = await user.related('workspaces').query();
      assert.equal(servicesForUser.length, 3);
      assert.equal(workspacesForUser.length, 3);

      const firstServiceUuid = servicesForUser.filter(
        s => s.name === 'random-service-1',
      )[0].serviceId;
      const secondServiceUuid = servicesForUser.filter(
        s => s.name === 'random-service-2',
      )[0].serviceId;
      const thirdServiceUUid = servicesForUser.filter(
        s => s.name === 'random-service-3',
      )[0].serviceId;

      // Assert the first workspace to not have any services
      const firstWorkspace = workspacesForUser.filter(
        w => w.name === 'workspace1',
      )[0];
      assert.empty(JSON.parse(firstWorkspace.services));

      const secondWorkspace = workspacesForUser.filter(
        w => w.name === 'workspace2',
      )[0];
      assert.deepEqual(JSON.parse(secondWorkspace.services), [
        firstServiceUuid,
        secondServiceUuid,
      ]);

      const thirdWorkspace = workspacesForUser.filter(
        w => w.name === 'workspace3',
      )[0];
      assert.deepEqual(JSON.parse(thirdWorkspace.services), [
        firstServiceUuid,
        secondServiceUuid,
        thirdServiceUUid,
      ]);
    }
  });
});
