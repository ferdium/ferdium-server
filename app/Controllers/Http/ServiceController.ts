import { v4 as uuid } from 'uuid'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Service from 'App/Models/Service'
import Env from '@ioc:Adonis/Core/Env'
import Application from '@ioc:Adonis/Core/Application'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Drive from '@ioc:Adonis/Core/Drive'
import { join } from 'path'

export default class ServiceController {
  // Create a new service for user
  public async create ({ request, response, auth }: HttpContextContract) {
    try {
      auth.user!.username
    } catch (error) {
      return response.forbidden('Missing or invalid api token')
    }

    const validations = schema.create({
      name: schema.string({}, [rules.required()]),
      recipeId: schema.string({}, [rules.required()]),
    })

    const data = await request.validate({ schema: validations })

    // // Validate user input
    // const validation = await validateAll(request.all(), {
    //   name: 'required|string',
    //   recipeId: 'required',
    // });
    // if (validation.fails()) {
    //   return response.status(401).send({
    //     message: 'Invalid POST arguments',
    //     messages: validation.messages(),
    //     status: 401,
    //   });
    // }

    // const data = request.all();

    // Get new, unused uuid
    let serviceId
    do {
      serviceId = uuid()
    } while ((await Service.findMany([{ serviceId }])).length > 0) // eslint-disable-line no-await-in-loop

    await Service.create({
      userId: auth.user!.id + '',
      serviceId,
      name: data.name,
      recipeId: data.recipeId,
      settings: JSON.stringify(data),
    })

    return response.send({
      data: {
        userId: auth.user!.id + '',
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
    })
  }

  // List all services a user has created
  public async list ({ response, auth }: HttpContextContract) {
    try {
      auth.user!.username
    } catch (error) {
      return response.send('Missing or invalid api token')
    }

    await auth.user?.load('services')

    const services = auth.user!.toObject().services

    // Convert to array with all data Franz wants
    const servicesArray = services.map((service) => {
      const settings =
        typeof service.settings === 'string' ? JSON.parse(service.settings) : service.settings

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
          ? `${Env.get('APP_URL')}/v1/icon/${service.serviceId}_${settings.iconId}`
          : null,
        id: service.serviceId,
        name: service.name,
        recipeId: service.recipeId,
        userId: auth.user!.id,
      }
    })

    return response.send(servicesArray)
  }

  public async edit ({ request, response, auth, params }: HttpContextContract) {
    try {
      auth.user!.username
    } catch (error) {
      return response.send('Missing or invalid api token')
    }

    const { id } = params

    const service = await Service.query()
      .where([{ serviceId: id, userId: auth.user!.id }])
      .first()

    if (service == null) {
      return response.notFound()
    }

    let settings =
      typeof service.settings === 'string' ? JSON.parse(service.settings) : service.settings

    if (request.file('icon')) {
      // Upload custom service icon
      const icon = request.file('icon', {
        extnames: ['jpg', 'gif', 'svg', 'png'],
        size: '2mb',
      })!

      const iconId = `${uuid()}.${icon?.extname}`

      icon.moveToDisk(join(service.serviceId, iconId), { visibility: 'public' }, 'cloudinary')

      await icon?.move(Application.tmpPath('uploads'), {
        name: iconId,
        overwrite: true,
      })

      if (icon?.state !== 'moved') {
        return response.internalServerError(icon?.errors)
      }

      settings = {
        ...settings,
        ...{
          iconId,
          customIconVersion:
            settings && settings.customIconVersion ? settings.customIconVersion + 1 : 1,
        },
      }

      // Update data in database
      service.settings = JSON.stringify(settings)
    }

    // Update service info
    const data = request.except(['icon'])
    settings = service.settings

    settings = {
      ...(typeof service.settings === 'string' ? JSON.parse(service.settings) : service.settings),
      ...data,
    }

    service.settings = JSON.stringify(settings)

    service.save()

    return response.send({
      data: {
        id,
        name: service?.name,
        ...settings,
        iconUrl: `${Env.get('APP_URL')}/v1/icon/${service.serviceId}_${settings.iconId}`,
        userId: auth.user!.id,
      },
      status: ['updated'],
    })
  }

  public async icon ({ params, response }: HttpContextContract) {
    const { id } = params

    const [serviceId, iconId] = id.split('_')

    if (await Drive.use('cloudinary').exists(join(serviceId, iconId))) {
      const stream = await Drive.use('cloudinary').getStream(join(serviceId, iconId))
      return response.stream(stream)
    }

    return response.notFound({
      status: 'Icon doesn\'t exist',
    })
  }

  public async reorder ({ request, response, auth }: HttpContextContract) {
    const data = request.all()

    for (const serviceId of Object.keys(data)) {
      // Get current settings from db
      const service = await Service.query() // eslint-disable-line no-await-in-loop
        .where('serviceId', serviceId)
        .where('userId', auth.user!.id)
        .first()
      if (service == null) {
        continue
      }

      const settings = {
        ...(typeof service.settings === 'string' ? JSON.parse(service.settings) : service.settings),
        order: data[serviceId],
      }

      service.settings = JSON.stringify(settings)

      service.save()
    }

    // Get new services
    const services = await Service.findMany([{ userId: auth.user!.id }])

    // Convert to array with all data Franz wants
    const servicesArray = services.map((service) => {
      const settings =
        typeof service.settings === 'string' ? JSON.parse(service.settings) : service.settings

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
          ? `${Env.get('APP_URL')}/v1/icon/${service.serviceId}_${settings.iconId}`
          : null,
        id: service.serviceId,
        name: service.name,
        recipeId: service.recipeId,
        userId: auth.user!.id,
      }
    })

    return response.send(servicesArray)
  }

  public async delete ({ params, auth, response }) {
    // Update data in database
    await Service.query().where('serviceId', params.id).where('userId', auth.user.id).delete()

    return response.send({
      message: 'Sucessfully deleted service',
      status: 200,
    })
  }
}

module.exports = ServiceController
