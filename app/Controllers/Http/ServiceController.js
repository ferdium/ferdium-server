const Service = use('App/Models/Service');
const { validateAll } = use('Validator');
const Env = use('Env');
const Helpers = use('Helpers');

const { v4: uuid } = require('uuid');
const path = require('path');
const fs = require('fs-extra');
const sanitize = require('sanitize-filename');

class ServiceController {
  // Create a new service for user
  async create({ request, response, auth }) {
    try {
      await auth.getUser();
    } catch (error) {
      return response.send('Missing or invalid api token');
    }

    // Validate user input
    const validation = await validateAll(request.all(), {
      name: 'required|string',
      recipeId: 'required',
    });
    if (validation.fails()) {
      return response.status(401).send({
        message: 'Invalid POST arguments',
        messages: validation.messages(),
        status: 401,
      });
    }

    const data = request.all();

    // Get new, unused uuid
    let serviceId;
    do {
      serviceId = uuid();
    } while (
      (await Service.query().where('serviceId', serviceId).fetch()).rows
        .length > 0
    ); // eslint-disable-line no-await-in-loop

    await Service.create({
      userId: auth.user.id,
      serviceId,
      name: data.name,
      recipeId: data.recipeId,
      settings: JSON.stringify(data),
    });

    return response.send({
      data: {
        userId: auth.user.id,
        id: serviceId,
        isEnabled: true,
        isNotificationEnabled: true,
        isBadgeEnabled: true,
        isMuted: false,
        isDarkModeEnabled: '',
        spellcheckerLanguage: '',
        order: 1,
        customRecipe: false,
        hasCustomIcon: false,
        workspaces: [],
        iconUrl: null,
        ...data,
      },
      status: ['created'],
    });
  }

  // List all services a user has created
  async list({ response, auth }) {
    try {
      await auth.getUser();
    } catch (error) {
      return response.send('Missing or invalid api token');
    }

    const services = (await auth.user.services().fetch()).rows;
    // Convert to array with all data Franz wants
    const servicesArray = services.map(service => {
      const settings =
        typeof service.settings === 'string'
          ? JSON.parse(service.settings)
          : service.settings;

      return {
        customRecipe: false,
        hasCustomIcon: !!settings.iconId,
        isBadgeEnabled: true,
        isDarkModeEnabled: '',
        isEnabled: true,
        isMuted: false,
        isNotificationEnabled: true,
        order: 1,
        spellcheckerLanguage: '',
        workspaces: [],
        ...settings,
        iconUrl: settings.iconId
          ? `${Env.get('APP_URL')}/v1/icon/${settings.iconId}`
          : null,
        id: service.serviceId,
        name: service.name,
        recipeId: service.recipeId,
        userId: auth.user.id,
      };
    });

    return response.send(servicesArray);
  }

  async edit({ request, response, auth, params }) {
    try {
      await auth.getUser();
    } catch (error) {
      return response.send('Missing or invalid api token');
    }

    if (request.file('icon')) {
      // Upload custom service icon
      const icon = request.file('icon', {
        types: ['image'],
        size: '2mb',
      });
      const { id } = params;
      const service = (
        await Service.query()
          .where('serviceId', id)
          .where('userId', auth.user.id)
          .fetch()
      ).rows[0];
      const settings =
        typeof service.settings === 'string'
          ? JSON.parse(service.settings)
          : service.settings;

      let iconId;
      do {
        iconId = uuid() + uuid();
        // eslint-disable-next-line no-await-in-loop
      } while (await fs.exists(path.join(Helpers.tmpPath('uploads'), iconId)));
      iconId = `${iconId}.${icon.extname}`;

      await icon.move(Helpers.tmpPath('uploads'), {
        name: iconId,
        overwrite: true,
      });

      if (!icon.moved()) {
        return response.status(500).send(icon.error());
      }

      const newSettings = {
        ...settings,
        ...{
          iconId,
          customIconVersion:
            settings && settings.customIconVersion
              ? settings.customIconVersion + 1
              : 1,
        },
      };

      // Update data in database
      await Service.query()
        .where('serviceId', id)
        .where('userId', auth.user.id)
        .update({
          name: service.name,
          settings: JSON.stringify(newSettings),
        });

      return response.send({
        data: {
          id,
          name: service.name,
          ...newSettings,
          iconUrl: `${Env.get('APP_URL')}/v1/icon/${newSettings.iconId}`,
          userId: auth.user.id,
        },
        status: ['updated'],
      });
    }
    // Update service info
    const data = request.all();
    const { id } = params;

    // Get current settings from db
    const serviceData = (
      await Service.query()
        .where('serviceId', id)
        .where('userId', auth.user.id)
        .fetch()
    ).rows[0];

    const settings = {
      ...(typeof serviceData.settings === 'string'
        ? JSON.parse(serviceData.settings)
        : serviceData.settings),
      ...data,
    };

    // Update data in database
    await Service.query()
      .where('serviceId', id)
      .where('userId', auth.user.id)
      .update({
        name: data.name,
        settings: JSON.stringify(settings),
      });

    // Get updated row
    const service = (
      await Service.query()
        .where('serviceId', id)
        .where('userId', auth.user.id)
        .fetch()
    ).rows[0];

    return response.send({
      data: {
        id,
        name: service.name,
        ...settings,
        iconUrl: `${Env.get('APP_URL')}/v1/icon/${settings.iconId}`,
        userId: auth.user.id,
      },
      status: ['updated'],
    });
  }

  async icon({ params, response }) {
    let { id } = params;

    id = sanitize(id);
    if (id === '') {
      return response.status(404).send({
        status: "Icon doesn't exist",
      });
    }

    const iconPath = path.join(Helpers.tmpPath('uploads'), id);

    try {
      await fs.access(iconPath);
    } catch (ex) {
      console.log(ex);
      // File not available.
      return response.status(404).send({
        status: "Icon doesn't exist",
      });
    }

    return response.download(iconPath);
  }

  async reorder({ request, response, auth }) {
    const data = request.all();

    for (const service of Object.keys(data)) {
      // Get current settings from db
      const serviceData = (
        await Service.query() // eslint-disable-line no-await-in-loop
          .where('serviceId', service)
          .where('userId', auth.user.id)
          .fetch()
      ).rows[0];

      const settings = {
        ...(typeof serviceData.settings === 'string'
          ? JSON.parse(serviceData.settings)
          : serviceData.settings),
        order: data[service],
      };

      // Update data in database
      await Service.query() // eslint-disable-line no-await-in-loop
        .where('serviceId', service)
        .where('userId', auth.user.id)
        .update({
          settings: JSON.stringify(settings),
        });
    }

    // Get new services
    const services = (await auth.user.services().fetch()).rows;
    // Convert to array with all data Franz wants
    const servicesArray = services.map(service => {
      const settings =
        typeof service.settings === 'string'
          ? JSON.parse(service.settings)
          : service.settings;

      return {
        customRecipe: false,
        hasCustomIcon: !!settings.iconId,
        isBadgeEnabled: true,
        isDarkModeEnabled: '',
        isEnabled: true,
        isMuted: false,
        isNotificationEnabled: true,
        order: 1,
        spellcheckerLanguage: '',
        workspaces: [],
        ...settings,
        iconUrl: settings.iconId
          ? `${Env.get('APP_URL')}/v1/icon/${settings.iconId}`
          : null,
        id: service.serviceId,
        name: service.name,
        recipeId: service.recipeId,
        userId: auth.user.id,
      };
    });

    return response.send(servicesArray);
  }

  async delete({ params, auth, response }) {
    // Update data in database
    await Service.query()
      .where('serviceId', params.id)
      .where('userId', auth.user.id)
      .delete();

    return response.send({
      message: 'Sucessfully deleted service',
      status: 200,
    });
  }
}

module.exports = ServiceController;
