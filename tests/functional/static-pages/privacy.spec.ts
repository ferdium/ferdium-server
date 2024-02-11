import { test } from '@japa/runner'

test.group('privacy page', () => {
  test('returns a 200 response', async ({ client }) => {
    const response = await client.get('/privacy')

    response.assertStatus(200)
    response.assertTextIncludes('PRIVACY POLICY')
  })
})
