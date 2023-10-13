import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { schema, rules, validator } from '@ioc:Adonis/Core/Validator';
import User from 'App/Models/User';

export default class ForgotPasswordController {
  /**
   * Display the forgot password form
   */
  public async show({ view }: HttpContextContract) {
    return view.render('dashboard/forgotPassword');
  }

  /**
   * Send forget password email to user
   */
  public async forgotPassword({ view, request }: HttpContextContract) {
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
