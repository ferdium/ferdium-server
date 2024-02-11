import { test } from '@japa/runner'

test.group('terms page', () => {
  test('returns a 200 response', async ({ client }) => {
    const response = await client.get('/terms')

    response.assertStatus(200)
    response.assertTextIncludes('Terms of Service')
  })
})
