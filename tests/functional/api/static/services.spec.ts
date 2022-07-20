import { test } from '@japa/runner';
import { apiVersion } from '../../../config';

test.group('API / Static / Services', () => {
  test('returns a 200 response with empty array', async ({ client }) => {
    const response = await client.get(`/${apiVersion}/services`);

    response.assertStatus(200);
    response.assertBody([]);
  });
});
