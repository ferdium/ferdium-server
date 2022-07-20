import { test } from '@japa/runner';
import { apiVersion } from '../../../config';

test.group('API / Static / Plans', () => {
  test('returns a 200 response with empty array', async ({ client }) => {
    const response = await client.get(`/${apiVersion}/payment/plans`);

    response.assertStatus(200);
    response.assertBody({
      month: {
        id: 'franz-supporter-license',
        price: 99,
      },
      year: {
        id: 'franz-supporter-license-year-2019',
        price: 99,
      },
    });
  });
});
