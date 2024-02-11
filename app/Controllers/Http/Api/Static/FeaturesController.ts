import type { HttpContext } from '@adonisjs/core/http'

export default class FeaturesController {
  public async show({ response }: HttpContext) {
    return response.send({
      isServiceProxyEnabled: true,
      isWorkspaceEnabled: true,
      isAnnouncementsEnabled: true,
      isSettingsWSEnabled: false,
      isMagicBarEnabled: true,
      isTodosEnabled: true,
    })
  }
}
