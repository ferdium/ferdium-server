import type { HttpContext } from '@adonisjs/core/http';

export default class DeleteController {
  /**
   * Display the delete page
   */
  public async show({ view }: HttpContext) {
    return view.render('dashboard/delete');
  }

  /**
   * Delete user and session
   */
  public async delete({ auth, response }: HttpContext) {
    auth.user?.delete();
    auth.use('web').logout();

    return response.redirect('/user/login');
  }
}
