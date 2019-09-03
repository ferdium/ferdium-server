'use strict'

const User = use('App/Models/User');
const Service = use('App/Models/Service');
const {
  validateAll
} = use('Validator');

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

    // Validate user input
    const validation = await validateAll(request.all(), {
      name: 'required|alpha',
      recipeId: 'required',
    });
    if (validation.fails()) {
      return response.status(401).send({
        "message": "Invalid POST arguments",
        "messages": validation.messages(),
        "status": 401
      })
    }

    const data = request.all();

    // Get new, unused uuid
    let serviceId;
    do {
      serviceId = uuid();
    } while ((await Service.query().where('serviceId', serviceId).fetch()).rows.length > 0)

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

  async edit({
    request,
    response,
    auth,
    params
  }) {
    try {
      await auth.getUser()
    } catch (error) {
      return response.send('Missing or invalid api token')
    }

    // Validate user input
    const validation = await validateAll(request.all(), {
      name: 'required',
    });
    if (validation.fails()) {
      return response.status(401).send({
        "message": "Invalid POST arguments",
        "messages": validation.messages(),
        "status": 401
      })
    }

    const data = request.all();
    const {
      id
    } = params;

    // Get current settings from db
    const serviceData = (await Service.query()
      .where('serviceId', id)
      .where('userId', auth.user.id).fetch()).rows[0];

    let settings = {
      ...JSON.parse(serviceData.settings),
      ...data,
    };

    // Update data in database
    await (Service.query()
      .where('serviceId', id)
      .where('userId', auth.user.id)).update({
        name: data.name,
        settings: JSON.stringify(settings)
      });

    // Get updated row
    const service = (await Service.query()
      .where('serviceId', id)
      .where('userId', auth.user.id).fetch()).rows[0];

    return response.send({
      "id": service.serviceId,
      "name": data.name,
      ...settings,
      "userId": auth.user.id
    })
  }

  async reorder({
    request,
    response,
    auth
  }) {
    const data = request.all();

    for (const service in data) {
      // Get current settings from db
      const serviceData = (await Service.query()
        .where('serviceId', service)
        .where('userId', auth.user.id).fetch()).rows[0];

      let settings = {
        ...JSON.parse(serviceData.settings),
        order: data[service]
      };

      // Update data in database
      await (Service.query()
        .where('serviceId', service)
        .where('userId', auth.user.id))
      .update({
        settings: JSON.stringify(settings)
      });
    }

    // Get new services
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

  update({
    request,
    response
  }) {
    return response.send([])
  }

  async delete({
    request,
    params,
    auth,
    response
  }) {
    // Update data in database
    await (Service.query()
      .where('serviceId', params.id)
      .where('userId', auth.user.id)).delete()

    return response.send({
      "message": "Sucessfully deleted service",
      "status": 200
    })
  }
}

module.exports = ServiceController
