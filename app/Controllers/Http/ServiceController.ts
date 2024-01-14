import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { schema } from '@ioc:Adonis/Core/Validator';
import Service from 'App/Models/Service';
import { url } from 'Config/app';
import { v4 as uuid } from 'uuid';
import * as fs from 'fs-extra';
import path from 'node:path';
import Application from '@ioc:Adonis/Core/Application';
import sanitize from 'sanitize-filename';

const createSchema = schema.create({
  name: schema.string(),
  recipeId: schema.string(),
});

export default class ServiceController {
  // Create a new service for user
  public async create({ request, response, auth }: HttpContextContract) {
    // @ts-expect-error Property 'user' does not exist on type 'HttpContextContract'.
    const user = auth.user ?? request.user;

    if (!user) {
      return response.unauthorized('Missing or invalid api token');
    }

    // Validate user input
    let data;
    try {
      data = await request.validate({ schema: createSchema });
    } catch (error) {
      return response.status(401).send({
        message: 'Invalid POST arguments',
        messages: error.messages,
        status: 401,
      });
    }

    // Get new, unused uuid
    let serviceId;
    do {
      serviceId = uuid();
    } while (
      // eslint-disable-next-line no-await-in-loop, unicorn/no-await-expression-member
      (await Service.query().where('serviceId', serviceId)).length > 0
    );

    await Service.create({
      userId: user.id,
      serviceId,
      name: data.name,
      recipeId: data.recipeId,
      settings: JSON.stringify(data),
    });

    return response.send({
      data: {
        userId: user.id,
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
        // eslint-disable-next-line unicorn/no-null
        iconUrl: null,
        ...data,
      },
      status: ['created'],
    });
  }

  // List all services a user has created
  public async list({ request, response, auth }: HttpContextContract) {
    // @ts-expect-error Property 'user' does not exist on type 'HttpContextContract'.
    const user = auth.user ?? request.user;

    if (!user) {
      return response.unauthorized('Missing or invalid api token');
    }

    const { id } = user;
    const services = await user.related('services').query();

    // Convert to array with all data Franz wants
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const servicesArray = services.map((service: any) => {
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
          ? `${url}/v1/icon/${settings.iconId}`
          : // eslint-disable-next-line unicorn/no-null
          null,
        id: service.serviceId,
        name: service.name,
        recipeId: service.recipeId,
        userId: id,
      };
    });

    return response.send(servicesArray);
  }

  public async delete({
    request,
    params,
    auth,
    response,
  }: HttpContextContract) {
    // @ts-expect-error Property 'user' does not exist on type 'HttpContextContract'.
    const user = auth.user ?? request.user;

    if (!user) {
      return response.unauthorized('Missing or invalid api token');
    }

    // Update data in database
    await Service.query()
      .where('serviceId', params.id)
      .where('userId', user.id)
      .delete();

    return response.send({
      message: 'Sucessfully deleted service',
      status: 200,
    });
  }

  // TODO: Test if icon upload works
  public async edit({ request, response, auth, params }: HttpContextContract) {
    // @ts-expect-error Property 'user' does not exist on type 'HttpContextContract'.
    const user = auth.user ?? request.user;

    if (!user) {
      return response.unauthorized('Missing or invalid api token');
    }

    const { id } = params;
    const service = await Service.query()
      .where('serviceId', id)
      .where('userId', user.id)
      .firstOrFail();

    if (request.file('icon')) {
      // Upload custom service icon
      const icon = request.file('icon', {
        extnames: ['png', 'jpg', 'jpeg', 'svg'],
        size: '2mb',
      });

      if (icon === null) {
        return response.badRequest('Icon not uploaded.');
      }

      const settings =
        typeof service.settings === 'string'
          ? JSON.parse(service.settings)
          : service.settings;

      let iconId;
      do {
        iconId = uuid() + uuid();
      } while (
        // eslint-disable-next-line no-await-in-loop
        await fs.exists(path.join(Application.tmpPath('uploads'), iconId))
      );
      iconId = `${iconId}.${icon.extname}`;

      await icon.move(Application.tmpPath('uploads'), {
        name: iconId,
        overwrite: true,
      });

      if (icon.state !== 'moved') {
        return response.status(500).send(icon.errors);
      }

      const newSettings = {
        ...settings,

        iconId,
        customIconVersion: settings?.customIconVersion
          ? settings.customIconVersion + 1
          : 1,
      };

      // Update data in database
      await Service.query()
        .where('serviceId', id)
        .where('userId', user.id)
        .update({
          name: service.name,
          settings: JSON.stringify(newSettings),
        });

      return response.send({
        data: {
          id,
          name: service.name,
          ...newSettings,
          iconUrl: `${url}/v1/icon/${newSettings.iconId}`,
          userId: user.id,
        },
        status: ['updated'],
      });
    }
    // Update service info
    const data = request.all();

    const settings = {
      ...(typeof service.settings === 'string'
        ? JSON.parse(service.settings)
        : service.settings),
      ...data,
    };

    if (settings.customIcon === 'delete') {
      fs.remove(
        path.join(Application.tmpPath('uploads'), settings.iconId),
      ).catch(error => {
        console.error(error);
      });

      settings.iconId = undefined;
      settings.customIconVersion = undefined;
      settings.customIcon = '';
    }

    // Update data in database
    await Service.query()
      .where('serviceId', id)
      .where('userId', user.id)
      .update({
        name: data.name,
        settings: JSON.stringify(settings),
      });

    // Get updated row
    const serviceUpdated = await Service.query()
      .where('serviceId', id)
      .where('userId', user.id)
      .firstOrFail();

    return response.send({
      data: {
        id,
        name: serviceUpdated.name,
        ...settings,
        iconUrl: `${url}/v1/icon/${settings.iconId}`,
        userId: user.id,
      },
      status: ['updated'],
    });
  }

  // TODO: Test if this works
  public async reorder({ request, response, auth }: HttpContextContract) {
    // @ts-expect-error Property 'user' does not exist on type 'HttpContextContract'.
    const user = auth.user ?? request.user;

    if (!user) {
      return response.unauthorized('Missing or invalid api token');
    }

    const data = request.all();

    for (const service of Object.keys(data)) {
      // Get current settings from db
      const serviceData = await Service.query() // eslint-disable-line no-await-in-loop
        .where('serviceId', service)
        .where('userId', user.id)

        .firstOrFail();

      const settings = {
        ...(typeof serviceData.settings === 'string'
          ? JSON.parse(serviceData.settings)
          : serviceData.settings),
        order: data[service],
      };

      // Update data in database
      await Service.query() // eslint-disable-line no-await-in-loop
        .where('serviceId', service)
        .where('userId', user.id)
        .update({
          settings: JSON.stringify(settings),
        });
    }

    // Get new services
    const services = await user.related('services').query();
    // Convert to array with all data Franz wants
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const servicesArray = services.map((service: any) => {
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
          ? `${url}/v1/icon/${settings.iconId}`
          : // eslint-disable-next-line unicorn/no-null
          null,
        id: service.serviceId,
        name: service.name,
        recipeId: service.recipeId,
        userId: user.id,
      };
    });

    return response.send(servicesArray);
  }

  // TODO: Test if this works
  public async icon({ params, response }: HttpContextContract) {
    let { id } = params;

    id = sanitize(id);
    if (id === '') {
      return response.status(404).send({
        status: 'Icon doesn\'t exist',
      });
    }

    const iconPath = path.join(Application.tmpPath('uploads'), id);

    try {
      await fs.access(iconPath);
    } catch {
      // File not available.
      return response.status(404).send({
        status: 'Icon doesn\'t exist',
      });
    }

    return response.download(iconPath);
  }
}
