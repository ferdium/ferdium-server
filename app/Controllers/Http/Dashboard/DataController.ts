import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Service from 'App/Models/Service';
import Workspace from 'App/Models/Workspace';

export default class DataController {
  /**
   * Display the data page
   */
  public async show({ view, auth }: HttpContextContract) {
    const { user } = auth;

    let services: Service[] = [];
    let workspaces: Workspace[] = [];

    if (user) {
      services = await Service.query().where('userId', user.id).orderBy('id', 'asc');
      workspaces = await Workspace.query()
        .where('userId', user.id)
        .orderBy('order', 'asc')
        .orderBy('id', 'asc');
    }

    return view.render('dashboard/data', {
      username: user?.username,
      lastname: user?.lastname,
      mail: user?.email,
      created: user?.created_at.toFormat('yyyy-MM-dd HH:mm:ss'),
      updated: user?.updated_at.toFormat('yyyy-MM-dd HH:mm:ss'),
      stringify: JSON.stringify,
      services,
      workspaces,
    });
  }
}
