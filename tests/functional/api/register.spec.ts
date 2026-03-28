import { test } from '@japa/runner';
import UserFactory from 'Database/factories/UserFactory';
import crypto from 'node:crypto';

function createLegacyApiPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('base64');
}

function createBasicAuthHeader(email: string, password: string) {
  return `Basic ${Buffer.from(`${email}:${password}`).toString('base64')}`;
}

test.group('API / Auth', () => {
  test('returns unique persisted JWTs for repeated login requests', async ({
    client,
    assert,
  }) => {
    const user = await UserFactory.create();
    const authorization = createBasicAuthHeader(
      user.email,
      createLegacyApiPassword('password'),
    );

    const [firstResponse, secondResponse] = await Promise.all([
      client.post('/v1/auth/login').header('Authorization', authorization),
      client.post('/v1/auth/login').header('Authorization', authorization),
    ]);

    firstResponse.assertStatus(200);
    secondResponse.assertStatus(200);

    const firstBody = JSON.parse(firstResponse.text());
    const secondBody = JSON.parse(secondResponse.text());

    assert.notEqual(firstBody.token, secondBody.token);
  });

  test('returns unique persisted JWTs for repeated new token requests', async ({
    client,
    assert,
  }) => {
    const user = await UserFactory.create();
    const loginResponse = await client
      .post('/v1/auth/login')
      .header(
        'Authorization',
        createBasicAuthHeader(user.email, createLegacyApiPassword('password')),
      );

    loginResponse.assertStatus(200);
    const { token } = JSON.parse(loginResponse.text());

    const [firstResponse, secondResponse] = await Promise.all([
      client
        .get('/v1/me/newtoken')
        .header('Authorization', `Bearer ${token}`),
      client
        .get('/v1/me/newtoken')
        .header('Authorization', `Bearer ${token}`),
    ]);

    firstResponse.assertStatus(200);
    secondResponse.assertStatus(200);

    const firstBody = JSON.parse(firstResponse.text());
    const secondBody = JSON.parse(secondResponse.text());

    assert.notEqual(firstBody.token, secondBody.token);
  });
});
