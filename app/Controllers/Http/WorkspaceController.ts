import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { validator, schema } from '@ioc:Adonis/Core/Validator';
import Database from '@ioc:Adonis/Lucid/Database';
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

export default class WorkspaceController {
  // Create a new workspace for user
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
    let workspaceId: string;
    let existingWorkspace: Workspace | null;
    do {
      workspaceId = uuid();
      // eslint-disable-next-line no-await-in-loop
      existingWorkspace = await Workspace.query()
        .where('workspaceId', workspaceId)
        .first();
    } while (existingWorkspace);

    const workspaceCount = await Database.from('workspaces')
      .where('userId', user.id)
      .count('* as total')
      .first();
    const order = Number(workspaceCount?.total ?? 0);

    await Workspace.create({
      userId: user.id,
      workspaceId,
      name: data.name,
      order,
      services: JSON.stringify([]),
      data: JSON.stringify(data),
    });

    return response.send({
      userId: user.id,
      name: data.name,
      id: workspaceId,
      order,
      workspaces: [],
    });
  }

  public async edit({ request, response, auth, params }: HttpContextContract) {
    // @ts-expect-error Property 'user' does not exist on type 'HttpContextContract'.
    const user = auth.user ?? request.user;

    if (!user) {
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
      .where('userId', user.id)
      .update({
        name: data.name,
        services: JSON.stringify(data.services),
        iconUrl: data.iconUrl,
      });

    // Get updated row
    const workspace = await Workspace.query()
      .where('workspaceId', id)
      .where('userId', user.id)
      .firstOrFail();

    return response.send({
      id: workspace.workspaceId,
      name: data.name,
      order: workspace.order,
      services: data.services,
      userId: user.id,
    });
  }

  public async delete({
    request,
    response,
    auth,
    params,
  }: HttpContextContract) {
    // @ts-expect-error Property 'user' does not exist on type 'HttpContextContract'.
    const user = auth.user ?? request.user;

    if (!user) {
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
      .where('userId', user.id)
      .delete();

    return response.send({
      message: 'Successfully deleted workspace',
    });
  }

  // List all workspaces a user has created
  public async list({ request, response, auth }: HttpContextContract) {
    // @ts-expect-error Property 'user' does not exist on type 'HttpContextContract'.
    const user = auth.user ?? request.user;

    if (!user) {
      return response.unauthorized('Missing or invalid api token');
    }

    const workspaces = await Workspace.query()
      .where('userId', user.id)
      .orderBy('order', 'asc')
      .orderBy('id', 'asc');
    // Convert to array with all data Franz wants
    let workspacesArray: object[] = [];
    if (workspaces) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      workspacesArray = workspaces.map((workspace: any) => ({
        id: workspace.workspaceId,
        name: workspace.name,
        iconUrl: workspace.iconUrl,
        order: workspace.order,
        services:
          typeof workspace.services === 'string'
            ? JSON.parse(workspace.services)
            : workspace.services,
        userId: user.id,
      }));
    }

    return response.send(workspacesArray);
  }
}
