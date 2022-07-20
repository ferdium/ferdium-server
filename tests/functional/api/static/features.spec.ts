import { test } from '@japa/runner';
import { apiVersion } from '../../../config';

const defaultResponse = {
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
};

test.group('API / Static / Features', () => {
  test('returns a 200 response with empty array', async ({ client }) => {
    const response = await client.get(`/${apiVersion}/features`);

    response.assertStatus(200);
    response.assertBody(defaultResponse);
  });

  test('returns a 200 response with expected object when calling with :mode', async ({
    client,
  }) => {
    const response = await client.get(`/${apiVersion}/features/random`);

    response.assertStatus(200);
    response.assertBody(defaultResponse);
  });
});
