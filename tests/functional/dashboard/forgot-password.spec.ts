import { test } from '@japa/runner';
import emitter from '@adonisjs/core/services/emitter';
import UserFactory from '#database/factories/UserFactory';

test.group('Dashboard / Forgot password page', () => {
  test('returns a 200 opening the forgot password route', async ({
    client,
  }) => {
    const response = await client.get('/user/forgot');

    response.assertStatus(200);
    response.assertTextIncludes('Forgot Password?');
  });

  test('returns `Please enter a valid email address` when providing invalid email', async ({
    client,
  }) => {
    const response = await client.post('/user/forgot').fields({
      mail: 'invalid',
    });

    response.assertStatus(200);
    response.assertTextIncludes('Please enter a valid email address');
  });

  test('returns `email send when exists` without forgot:password event', async ({
    client,
    assert,
  }) => {
    const emitterService = emitter.fake();

    const response = await client.post('/user/forgot').fields({
      mail: 'test@ferdium.org',
    });

    response.assertStatus(200);
    response.assertTextIncludes(
      'If your provided E-Mail address is linked to an account, we have just sent an E-Mail to that address.',
    );

    assert.isFalse(emitterService.exists('forgot:password'));
  });

  test('returns `email send when exists` and trigger forgot:password event', async ({
    client,
    assert,
  }) => {
    const emitterService = emitter.fake();
    const user = await UserFactory.merge({
      email: 'test+forgot_password@ferdium.org',
    }).create();

    const response = await client.post('/user/forgot').fields({
      mail: 'test+forgot_password@ferdium.org',
    });

    response.assertStatus(200);
    response.assertTextIncludes(
      'If your provided E-Mail address is linked to an account, we have just sent an E-Mail to that address.',
    );

    assert.isTrue(
      emitterService.exists(
        event =>
          event.name === 'forgot:password' &&
          event.data.user.email === user.email,
      ),
    );
  });
});
