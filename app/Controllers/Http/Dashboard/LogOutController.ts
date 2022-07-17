import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class LogOutController {
  /**
   * Login a user
   */
  public async logout({ auth, response }: HttpContextContract) {
    auth.logout();

    return response.redirect('/user/login');
  }
}
