import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class FeaturesController {
  public async show({ response }: HttpContextContract) {
    return response.send({
      isServiceProxyEnabled: true,
      isWorkspaceEnabled: true,
      isAnnouncementsEnabled: true,
      isSettingsWSEnabled: false,
      isMagicBarEnabled: true,
      isTodosEnabled: true,
    });
  }
}
