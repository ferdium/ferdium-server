import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class DeleteController {
  /**
   * Display the delete page
   */
  public async show({ view }: HttpContextContract) {
    return view.render('dashboard/delete');
  }

  /**
   * Delete user and sessin
   */
  public async delete({ auth, response }) {
    auth.user.delete();
    auth.authenticator('session').logout();

    return response.redirect('/user/login');
  }
}
