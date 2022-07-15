import { test } from '@japa/runner';

test.group('health page', () => {
  test('returns a 200 response', async ({ client }) => {
    const response = await client.get('/health');

    response.assertStatus(200);
    response.assertBodyContains({
      api: 'success',
      db: 'success',
    });
  });
});
