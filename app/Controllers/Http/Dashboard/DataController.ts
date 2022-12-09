import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class DataController {
  /**
   * Display the data page
   */
  public async show({ view, auth }: HttpContextContract) {
    const { user } = auth;

    return view.render('dashboard/data', {
      username: user?.username,
      lastname: user?.lastname,
      mail: user?.email,
      created: user?.created_at.toFormat('yyyy-MM-dd HH:mm:ss'),
      updated: user?.updated_at.toFormat('yyyy-MM-dd HH:mm:ss'),
      stringify: JSON.stringify,
      services: [], // TODO
      workspaces: [], // TODO
    });
  }
}
