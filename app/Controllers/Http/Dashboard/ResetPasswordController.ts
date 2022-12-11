import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class ResetPasswordController {
  /**
   * Display the reset password form
   */
  public async show({ view, request }: HttpContextContract) {
    const { token } = request.qs();

    if (token) {
      return view.render('dashboard.resetPassword', { token });
    }

    return view.render('others.message', {
      heading: 'Invalid token',
      text: 'Please make sure you are using a valid and recent link to reset your password.',
    });
  }

  /**
   * Resets user password
   */
  public async resetPassword() {
    // inplement your logic here
  }
}
