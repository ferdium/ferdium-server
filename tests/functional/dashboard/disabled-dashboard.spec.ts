import { test } from '@japa/runner';
import Config from '@ioc:Adonis/Core/Config';

const disabledDashboardMessage =
  'The user dashboard is disabled on this server\n\nIf you are the server owner, please set IS_DASHBOARD_ENABLED to true to enable the dashboard.';

test.group('Dashboard / Disabled dashboard', group => {
  group.setup(() => {
    Config.set('dashboard.enabled', false);
  });

  group.teardown(() => {
    Config.set('dashboard.enabled', true);
  });

  test('Login page returns disabled dashboard message', async ({ client }) => {
    const response = await client.get('/user/login');

    response.assertTextIncludes(disabledDashboardMessage);
  });

  test('Forgot password page returns disabled dashboard message', async ({
    client,
  }) => {
    const response = await client.get('/user/forgot');

    response.assertTextIncludes(disabledDashboardMessage);
  });

  test('Reset password page returns disabled dashboard message', async ({
    client,
  }) => {
    const response = await client.get('/user/reset');

    response.assertTextIncludes(disabledDashboardMessage);
  });

  test('Account page returns disabled dashboard message', async ({
    client,
  }) => {
    const response = await client.get('/user/account');

    response.assertTextIncludes(disabledDashboardMessage);
  });

  test('Data page returns disabled dashboard message', async ({ client }) => {
    const response = await client.get('/user/data');

    response.assertTextIncludes(disabledDashboardMessage);
  });

  test('Export page returns disabled dashboard message', async ({ client }) => {
    const response = await client.get('/user/export');

    response.assertTextIncludes(disabledDashboardMessage);
  });

  test('Transfer page returns disabled dashboard message', async ({
    client,
  }) => {
    const response = await client.get('/user/transfer');

    response.assertTextIncludes(disabledDashboardMessage);
  });

  test('Logout page returns disabled dashboard message', async ({ client }) => {
    const response = await client.get('/user/logout');

    response.assertTextIncludes(disabledDashboardMessage);
  });
});
