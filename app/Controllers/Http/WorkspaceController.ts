import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { validator, schema } from '@ioc:Adonis/Core/Validator';
import Workspace from 'App/Models/Workspace';
import { v4 as uuid } from 'uuid';

const createSchema = schema.create({
  name: schema.string(),
});

const editSchema = schema.create({
  name: schema.string(),
});

const deleteSchema = schema.create({
  id: schema.string(),
});

export default class WorkspacesController {
  // Create a new workspace for user
  public async create({ request, response, auth }: HttpContextContract) {
    if (!auth.user) {
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
    let workspaceId;
    do {
      workspaceId = uuid();
    } while (
      // eslint-disable-next-line unicorn/no-await-expression-member, no-await-in-loop
      (await Workspace.query().where('workspaceId', workspaceId)).length > 0
    );

    // eslint-disable-next-line unicorn/no-await-expression-member
    const order = (await auth.user.related('workspaces').query()).length;

    await Workspace.create({
      userId: auth.user.id,
      workspaceId,
      name: data.name,
      order,
      services: JSON.stringify([]),
      data: JSON.stringify(data),
    });

    return response.send({
      userId: auth.user.id,
      name: data.name,
      id: workspaceId,
      order,
      workspaces: [],
    });
  }

  public async edit({ request, response, auth, params }: HttpContextContract) {
    if (!auth.user) {
      return response.unauthorized('Missing or invalid api token');
    }

    // Validate user input
    try {
      await request.validate({ schema: editSchema });
    } catch (error) {
      return response.status(401).send({
        message: 'Invalid POST arguments',
        messages: error.messages,
        status: 401,
      });
    }

    const data = request.all();
    const { id } = params;

    // Update data in database
    await Workspace.query()
      .where('workspaceId', id)
      .where('userId', auth.user.id)
      .update({
        name: data.name,
        services: JSON.stringify(data.services),
      });

    // Get updated row
    const workspace = await Workspace.query()
      .where('workspaceId', id)
      .where('userId', auth.user.id)
      .firstOrFail();

    return response.send({
      id: workspace.workspaceId,
      name: data.name,
      order: workspace.order,
      services: data.services,
      userId: auth.user.id,
    });
  }

  public async delete({ response, auth, params }: HttpContextContract) {
    if (!auth.user) {
      return response.unauthorized('Missing or invalid api token');
    }

    // Validate user input
    let data;
    try {
      data = await validator.validate({
        data: params,
        schema: deleteSchema,
      });
    } catch (error) {
      return response.status(401).send({
        message: 'Invalid arguments',
        messages: error.messages,
        status: 401,
      });
    }

    const { id } = data;

    // Update data in database
    await Workspace.query()
      .where('workspaceId', id)
      .where('userId', auth.user.id)
      .delete();

    return response.send({
      message: 'Successfully deleted workspace',
    });
  }

  // List all workspaces a user has created
  public async list({ response, auth }: HttpContextContract) {
    if (!auth.user) {
      return response.unauthorized('Missing or invalid api token');
    }

    const workspaces = await auth.user.related('workspaces').query();
    // Convert to array with all data Franz wants
    let workspacesArray: object[] = [];
    if (workspaces) {
      workspacesArray = workspaces.map(workspace => ({
        id: workspace.workspaceId,
        name: workspace.name,
        order: workspace.order,
        services:
          typeof workspace.services === 'string'
            ? JSON.parse(workspace.services)
            : workspace.services,
        userId: auth.user!.id,
      }));
    }

    return response.send(workspacesArray);
  }
}
