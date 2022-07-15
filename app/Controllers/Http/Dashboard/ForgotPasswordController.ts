import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class ForgotPasswordController {
  /**
   * Display the forgot password form
   */
  public async show({ view }: HttpContextContract) {
    return view.render('dashboard.forgotPassword');
  }

  /**
   * Send forget password email to user
   */
  public async forgotPassword() {
    // inplement your logic here
  }
}
