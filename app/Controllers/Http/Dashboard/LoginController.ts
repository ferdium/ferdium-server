import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class LoginController {
  /**
   * Display the login form
   */
  public async show({ view }: HttpContextContract) {
    return view.render('dashboard.login');
  }

  /**
   * Login a user
   */
  public async login() {
    // inplement your logic here
  }
}
