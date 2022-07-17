import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class TransferController {
  /**
   * Display the transfer page
   */
  public async show({ view }: HttpContextContract) {
    return view.render('dashboard/transfer');
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
