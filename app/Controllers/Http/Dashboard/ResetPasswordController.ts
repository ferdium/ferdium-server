import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { schema, rules, validator } from '@ioc:Adonis/Core/Validator';
import Token from 'App/Models/Token';
import moment from 'moment';
import crypto from 'node:crypto';

export default class ResetPasswordController {
  /**
   * Display the reset password form
   */
  public async show({ view, request }: HttpContextContract) {
    const { token } = request.qs();

    if (token) {
      return view.render('dashboard/resetPassword', { token });
    }

    return view.render('others/message', {
      heading: 'Invalid token',
      text: 'Please make sure you are using a valid and recent link to reset your password.',
    });
  }

  /**
   * Resets user password
   */
  public async resetPassword({
    response,
    request,
    session,
    view,
  }: HttpContextContract) {
    try {
      await validator.validate({
        schema: schema.create({
          password: schema.string([rules.required(), rules.confirmed()]),
          token: schema.string([rules.required()]),
        }),
        data: request.only(['password', 'password_confirmation', 'token']),
      });
    } catch {
      session.flash({
        type: 'danger',
        message: 'Passwords do not match',
      });

      return response.redirect(`/user/reset?token=${request.input('token')}`);
    }

    const tokenRow = await Token.query()
      .preload('user')
      .where('token', request.input('token'))
      .where('type', 'forgot_password')
      .where('is_revoked', false)
      .where(
        'updated_at',
        '>=',
        moment().subtract(24, 'hours').format('YYYY-MM-DD HH:mm:ss'),
      )
      .first();

    if (!tokenRow) {
      return view.render('others/message', {
        heading: 'Cannot reset your password',
        text: 'Please make sure you are using a valid and recent link to reset your password and that your passwords entered match.',
      });
    }

    // Update user password
    const hashedPassword = crypto
      .createHash('sha256')
      .update(request.input('password'))
      .digest('base64');
    tokenRow.user.password = hashedPassword;
    await tokenRow.user.save();

    // Delete token to prevent it from being used again
    await tokenRow.delete();

    return view.render('others/message', {
      heading: 'Reset password',
      text: 'Successfully reset your password. You can now login to your account using your new password.',
    });
  }
}
