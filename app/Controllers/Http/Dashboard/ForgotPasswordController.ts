import type { HttpContext } from '@adonisjs/core/http';
import { schema, rules, validator } from '@adonisjs/validator';
import User from '#app/Models/User';

export default class ForgotPasswordController {
  /**
   * Display the forgot password form
   */
  public async show({ view }: HttpContext) {
    return view.render('dashboard/forgotPassword');
  }

  /**
   * Send forget password email to user
   */
  public async forgotPassword({ view, request }: HttpContext) {
    try {
      await validator.validate({
        schema: schema.create({
          mail: schema.string([rules.email(), rules.required()]),
        }),
        data: request.only(['mail']),
      });
    } catch {
      return view.render('others/message', {
        heading: 'Cannot reset your password',
        text: 'Please enter a valid email address',
      });
    }

    try {
      const user = await User.findByOrFail('email', request.input('mail'));
      await user.forgotPassword();
    } catch {}

    return view.render('others/message', {
      heading: 'Reset password',
      text: 'If your provided E-Mail address is linked to an account, we have just sent an E-Mail to that address.',
    });
  }
}
