import { test } from '@japa/runner'
import { apiVersion } from '../../../config.js'

const defaultResponse = {
  isServiceProxyEnabled: true,
  isWorkspaceEnabled: true,
  isAnnouncementsEnabled: true,
  isSettingsWSEnabled: false,
  isMagicBarEnabled: true,
  isTodosEnabled: true,
}

test.group('API / Static / Features', () => {
  test('returns a 200 response with empty array', async ({ client }) => {
    const response = await client.get(`/${apiVersion}/features`)

    response.assertStatus(200)
    response.assertBody(defaultResponse)
  })

  test('returns a 200 response with expected object when calling with :mode', async ({
    client,
  }) => {
    const response = await client.get(`/${apiVersion}/features/random`)

    response.assertStatus(200)
    response.assertBody(defaultResponse)
  })
})
