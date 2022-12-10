/**
 * Controller for routes with static responses
 */
const Helpers = use('Helpers');
const fs = require('fs-extra');
const path = require('path');

class StaticController {
  // Enable all features
  features({
    response,
  }) {
    return response.send({
      isServiceProxyEnabled: true,
      isWorkspaceEnabled: true,
      isAnnouncementsEnabled: true,
      isSettingsWSEnabled: false,
      isMagicBarEnabled: true,
      isTodosEnabled: true,
    });
  }

  // Return an empty array
  emptyArray({
    response,
  }) {
    return response.send([]);
  }

  // Show announcements
  async announcement({
    response,
    params,
  }) {
    const announcement = path.join(Helpers.resourcesPath(), 'announcements', `${params.version}.json`);

    if (await fs.pathExists(announcement)) {
      return response.download(announcement);
    }
    return response.status(404).send('No announcement found.');
  }
}

module.exports = StaticController;
