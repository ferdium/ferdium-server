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
    let workspaceId;
    do {
      workspaceId = uuid();
    } while (
      // eslint-disable-next-line unicorn/no-await-expression-member, no-await-in-loop
      (await Workspace.query().where('workspaceId', workspaceId)).length > 0
    );

    // eslint-disable-next-line unicorn/no-await-expression-member
    const order = (await user.related('workspaces').query()).length;

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

    const workspaces = await user.related('workspaces').query();
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
