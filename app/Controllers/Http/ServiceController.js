'use strict'

const User = use('App/Models/User');
const Service = use('App/Models/Service');
const uuid = require('uuid/v4');

class ServiceController {
  // Create a new service for user
  async create({
    request,
    response,
    auth
  }) {
    try {
      await auth.getUser()
    } catch (error) {
      return response.send('Missing or invalid api token')
    }

    const data = request.all();

    // Get new, unused uuid
    let serviceId;
    do {
      serviceId = uuid();
    } while((await Service.query().where('serviceId', serviceId).fetch()).rows.length > 0)

    const service = await Service.create({
      userId: auth.user.id,
      serviceId,
      name: data.name,
      recipeId: data.recipeId,
      settings: JSON.stringify(data)
    });

    return response.send({
      "data": {
        userId: auth.user.id,
        id: serviceId,
        "isEnabled": true,
        "isNotificationEnabled": true,
        "isBadgeEnabled": true,
        "isMuted": false,
        "isDarkModeEnabled": "",
        "spellcheckerLanguage": "",
        "order": 1,
        "customRecipe": false,
        "hasCustomIcon": false,
        "workspaces": [],
        "iconUrl": null,
        ...data,
      },
      "status": ["created"]
    })
  }

  // List all services a user has created
  async list({
    request,
    response,
    auth
  }) {
    try {
      await auth.getUser()
    } catch (error) {
      return response.send('Missing or invalid api token')
    }

    
    const services = (await auth.user.services().fetch()).rows;
    // Convert to array with all data Franz wants
    const servicesArray = services.map(service => ({
        "customRecipe": false,
        "hasCustomIcon": false,
        "isBadgeEnabled": true,
        "isDarkModeEnabled": "",
        "isEnabled": true,
        "isMuted": false,
        "isNotificationEnabled": true,
        "order": 1,
        "spellcheckerLanguage": "",
        "workspaces": [],
        "iconUrl": null,
        ...JSON.parse(service.settings),
        "id": service.serviceId,
        "name": service.name,
        "recipeId": service.recipeId,
        "userId": auth.user.id,
    }))

    return response.send(servicesArray)
  }

  // Download a recipe (currently simply redirects to Franz's API)
  download({ request, response, params }) {
    const service = params.recipe;

    response.redirect('https://api.franzinfra.com/v1/recipes/download/' + service)
  }
}

module.exports = ServiceController
