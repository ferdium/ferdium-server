import type { HttpContext } from '@adonisjs/core/http';

export default class LogOutController {
  /**
   * Login a user
   */
  public async logout({ auth, response }: HttpContext) {
    auth.logout();

    return response.redirect('/user/login');
  }
}
