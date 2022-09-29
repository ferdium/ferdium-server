import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Workspace from 'App/Models/Workspace'
import { v4 as uuid } from 'uuid'

export default class WorkspaceController {
  // Create a new workspace for user
  public async create ({ request, response, auth }: HttpContextContract) {
    try {
      auth.user!.username
    } catch (error) {
      return response.send('Missing or invalid api token')
    }

    const validations = schema.create({
      name: schema.string({}, [rules.required()]),
    })

    const data = await request.validate({ schema: validations })

    // // Validate user input
    // const validation = await validateAll(request.all(), {
    //   name: 'required',
    // });
    // if (validation.fails()) {
    //   return response.unauthorized({
    //     message: 'Invalid POST arguments',
    //     messages: validation.messages(),
    //     status: 401,
    //   });
    // }

    // const data = request.all();

    // Get new, unused uuid
    let workspaceId
    do {
      workspaceId = uuid()
    } while ((await Workspace.query().where('workspaceId', workspaceId)).length > 0) // eslint-disable-line no-await-in-loop

    const order = (
      await Workspace.query().where({
        userId: auth.user!.id,
      })
    ).length

    await auth.user!.workspaces.model.create({
      workspaceId,
      name: data.name,
      order,
      services: [],
      data: JSON.stringify(data),
    })

    return response.send({
      userId: auth.user!.id,
      name: data.name,
      id: workspaceId,
      order,
      workspaces: [],
    })
  }

  public async edit ({ request, response, auth, params }: HttpContextContract) {
    try {
      auth.user!.username
    } catch (error) {
      return response.forbidden('Missing or invalid api token')
    }

    const validations = schema.create({
      name: schema.string({}, [rules.required()]),
      services: schema.array([rules.required()]).members(schema.string()),
    })

    const data = await request.validate({ schema: validations })

    // // Validate user input
    // const validation = await validateAll(request.all(), {
    //   name: 'required',
    // });
    // if (validation.fails()) {
    //   return response.status(401).send({
    //     message: 'Invalid POST arguments',
    //     messages: validation.messages(),
    //     status: 401,
    //   });
    // }

    // const data = request.all();
    const { id } = params

    // Update data in database
    const workspace = await Workspace.query()
      .where('workspaceId', id)
      .where('userId', auth.user!.id)
      .firstOrFail()

    workspace.name = data.name
    workspace.services = data.services

    await workspace.save()

    return response.send({
      id: workspace.workspaceId,
      name: workspace.name,
      order: workspace.order,
      services: workspace.services,
      userId: auth.user!.id,
    })
  }

  public async delete ({ response, request, auth }: HttpContextContract) {
    try {
      auth.user!.username
    } catch (error) {
      return response.send('Missing or invalid api token')
    }

    const validations = schema.create({
      id: schema.number([rules.required()]),
    })

    const data = await request.validate({ schema: validations })

    // // Validate user input
    // const validation = await validateAll(params, {
    //   id: 'required',
    // });
    // if (validation.fails()) {
    //   return response.status(401).send({
    //     message: 'Invalid arguments',
    //     messages: validation.messages(),
    //     status: 401,
    //   });
    // }

    const { id } = data

    // Update data in database
    const workspace = await Workspace.query()
      .where('workspaceId', id)
      .where('userId', auth.user!.id)
      .firstOrFail()

    workspace.delete()

    return response.ok({
      message: 'Successfully deleted workspace',
    })
  }

  // List all workspaces a user has created
  public async list ({ response, auth }) {
    try {
      await auth.getUser()
    } catch (error) {
      return response.send('Missing or invalid api token')
    }

    const workspaces = (await auth.user.workspaces().fetch()).rows
    // Convert to array with all data Franz wants
    let workspacesArray = []
    if (workspaces) {
      workspacesArray = workspaces.map((workspace) => ({
        id: workspace.workspaceId,
        name: workspace.name,
        order: workspace.order,
        services:
          typeof workspace.services === 'string'
            ? JSON.parse(workspace.services)
            : workspace.services,
        userId: auth.user.id,
      }))
    }

    return response.send(workspacesArray)
  }
}
