/**
 * Controller for routes with static responses
 */
import * as fs from 'fs-extra'
import Application from '@ioc:Adonis/Core/Application'

import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class StaticController {
  // Enable all features
  public features ({ response }: HttpContextContract) {
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
    })
  }

  // Return an empty array
  public emptyArray ({ response }) {
    return response.send([])
  }

  // Payment plans availible
  public plans ({ response }) {
    return response.send({
      month: {
        id: 'franz-supporter-license',
        price: 99,
      },
      year: {
        id: 'franz-supporter-license-year-2019',
        price: 99,
      },
    })
  }

  // Show announcements
  public async announcement ({ response, params }: HttpContextContract) {
    const announcement = Application.resourcesPath('announcements', `${params.version}.json`)

    if (await fs.pathExists(announcement)) {
      return response.download(announcement)
    }
    return response.notFound('No announcement found.')
  }
}
