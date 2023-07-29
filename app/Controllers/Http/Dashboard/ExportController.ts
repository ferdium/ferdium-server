import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class ExportController {
  /**
   * Display the export page
   */
  public async show({ auth, response }: HttpContextContract) {
    const user = auth.user!;
    const services = await user.related('services').query();
    const workspaces = await user.related('workspaces').query();

    const exportData = {
      username: user.username,
      lastname: user.lastname,
      mail: user.email,
      services: JSON.parse(JSON.stringify(services)),
      workspaces: JSON.parse(JSON.stringify(workspaces)),
    };

    return response
      .header('Content-Type', 'application/force-download')
      .header('Content-disposition', 'attachment; filename=export.ferdium-data')
      .send(exportData);
  }
}
