import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class DeleteController {
  /**
   * Display the delete page
   */
  public async show({ view }: HttpContextContract) {
    return view.render('dashboard/delete');
  }

  /**
   * Delete user and session
   */
  public async delete({ auth, response }: HttpContextContract) {
    auth.user?.delete();
    auth.use('web').logout();

    return response.redirect('/user/login');
  }
}
