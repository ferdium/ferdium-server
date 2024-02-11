import { test } from '@japa/runner'
import { apiVersion } from '../../../config.js'

test.group('API / Static / News', () => {
  test('returns a 200 response with empty array', async ({ client }) => {
    const response = await client.get(`/${apiVersion}/news`)

    response.assertStatus(200)
    response.assertBody([])
  })
})
