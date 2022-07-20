import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class FeaturesController {
  public async show({ response }: HttpContextContract) {
    return response.send({
      needToWaitToProceed: false,
      isSpellcheckerPremiumFeature: false,
      isSpellcheckerIncludedInCurrentPlan: true,
      isServiceProxyEnabled: true,
      isServiceProxyIncludedInCurrentPlan: true,
      isServiceProxyPremiumFeature: true,
      isWorkspacePremiumFeature: false,
      isWorkspaceEnabled: true,
      isAnnouncementsEnabled: true,
      isSettingsWSEnabled: false,
      isServiceLimitEnabled: false,
      serviceLimitCount: 0,
      isCommunityRecipesPremiumFeature: false,
      isCommunityRecipesIncludedInCurrentPlan: true,
      isCustomUrlIncludedInCurrentPlan: true,
      isMagicBarEnabled: true,
      isTeamManagementIncludedInCurrentPlan: true,
      isTodosEnabled: true,
      isTodosIncludedInCurrentPlan: true,
      defaultTrialPlan: 'franz-pro-yearly',
      subscribeURL: 'https://ferdium.org',
      planSelectionURL: 'https://ferdium.org',
      hasInlineCheckout: true,
      isPlanSelectionEnabled: false,
      isTrialStatusBarEnabled: false,
      canSkipTrial: true,
      pricingConfig: {
        currency: '$',
        currencyID: 'USD',
        plans: {
          personal: {
            monthly: {
              id: 'ferdium-free',
              price: 0,
              billed: 0,
            },
            yearly: {
              id: 'ferdium-completely-free',
              price: 0,
              billed: 0,
            },
          },
          pro: {
            monthly: {
              id: 'ferdium-still-free',
              price: 0,
              billed: 0,
            },
            yearly: {
              id: 'ferdium-forever-free',
              price: 0,
              billed: 0,
            },
          },
        },
      },
    });
  }
}
