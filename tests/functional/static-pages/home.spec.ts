import { test } from '@japa/runner'

test.group('home page', () => {
  test('returns a 200 response', async ({ client }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    response.assertTextIncludes('Go to account dashboard')
  })
})
