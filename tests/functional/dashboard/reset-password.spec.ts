import { test } from '@japa/runner';
import Token from '#app/Models/Token';
import UserFactory from '#database/factories/UserFactory';
import TokenFactory from '#database/factories/TokenFactory';

test.group('Dashboard / Reset password page', () => {
  test('returns a `Invalid token` message when opening without a token', async ({
    client,
  }) => {
    const response = await client.get('/user/reset');

    response.assertStatus(200);
    response.assertTextIncludes('Invalid token');
  });

  test('displays the form when a token is provided', async ({ client }) => {
    const response = await client.get(
      '/user/reset?token=randomtokenbutitworks',
    );

    response.assertStatus(200);
    response.assertTextIncludes('Reset Your Password');
  });

  test('returns `passwords do not match` message when passwords do not match', async ({
    client,
  }) => {
    const response = await client.post('/user/reset').fields({
      token: 'randomnotworkingtoken',
      password: 'password',
      password_confirmation: 'not_matching',
    });

    response.assertTextIncludes('Passwords do not match');
  });

  test('returns `Cannot reset your password` when token does not exist', async ({
    client,
  }) => {
    const response = await client.post('/user/reset').fields({
      token: 'randomnotworkingtoken',
      password: 'password',
      password_confirmation: 'password',
    });

    response.assertTextIncludes('Cannot reset your password');
  });

  test('returns `Cannot reset your password` when token is older than 24 hours', async ({
    client,
  }) => {
    const token = await TokenFactory.merge({
      // eslint-disable-next-line unicorn/no-await-expression-member
      user_id: (await UserFactory.create()).id,
    })
      .apply('old_token')
      .create();

    const response = await client.post('/user/reset').fields({
      token: token.token,
      password: 'password',
      password_confirmation: 'password',
    });

    response.assertTextIncludes('Cannot reset your password');
  });

  test('returns `Cannot reset your password` when token is revoked', async ({
    client,
  }) => {
    const token = await TokenFactory.merge({
      // eslint-disable-next-line unicorn/no-await-expression-member
      user_id: (await UserFactory.create()).id,
    })
      .apply('revoked')
      .create();

    const response = await client.post('/user/reset').fields({
      token: token.token,
      password: 'password',
      password_confirmation: 'password',
    });

    response.assertTextIncludes('Cannot reset your password');
  });

  test('correctly resets password and deletes token and able to login with new password', async ({
    client,
    assert,
  }) => {
    const userEmail = 'working-reset-password-login@ferdium.org';
    const token = await TokenFactory.merge({
      user_id:
        (
          await UserFactory.merge({
            email: userEmail,
          }).create()
        // prettier-ignore
        // eslint-disable-next-line unicorn/no-await-expression-member
        ).id,
    }).create();

    const response = await client.post('/user/reset').fields({
      token: token.token,
      password: 'new_password',
      password_confirmation: 'new_password',
    });

    // Assert response is as expected
    response.assertTextIncludes('Successfully reset your password');

    // Token should be deleted from database
    assert.isNull(await Token.query().where('token', token.token).first());

    const loginResponse = await client.post('/user/login').fields({
      mail: userEmail,
      password: 'new_password',
    });

    loginResponse.assertRedirectsTo('/user/account');
  });
});
