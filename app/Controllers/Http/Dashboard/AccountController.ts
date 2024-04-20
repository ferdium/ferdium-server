import type { HttpContext } from '@adonisjs/core/http';
import { schema, rules, validator } from '@adonisjs/validator';
import crypto from 'node:crypto';

export default class AccountController {
  /**
   * Shows the user account page
   */
  public async show({ auth, view }: HttpContext) {
    return view.render('dashboard/account', {
      username: auth.user?.username,
      email: auth.user?.email,
      lastname: auth.user?.lastname,
    });
  }

  /**
   * Stores user account data
   */
  public async store({ auth, request, response, session, view }: HttpContext) {
    try {
      await validator.validate({
        schema: schema.create({
          username: schema.string([
            rules.required(),
            rules.unique({
              table: 'users',
              column: 'username',
              caseInsensitive: true,
              whereNot: { id: auth.user?.id },
            }),
          ]),
          email: schema.string([
            rules.required(),
            rules.unique({
              table: 'users',
              column: 'email',
              caseInsensitive: true,
              whereNot: { id: auth.user?.id },
            }),
          ]),
          lastname: schema.string([rules.required()]),
        }),
        data: request.only(['username', 'email', 'lastname']),
      });
    } catch (error) {
      session.flash(error.messages);
      return response.redirect('/user/account');
    }

    // Update user account
    const { user } = auth;
    if (user) {
      user.username = request.input('username');
      user.lastname = request.input('lastname');
      user.email = request.input('email');
      if (request.input('password')) {
        const hashedPassword = crypto
          .createHash('sha256')
          .update(request.input('password'))
          .digest('base64');
        user.password = hashedPassword;
      }
      await user.save();
    }

    return view.render('dashboard/account', {
      username: user?.username,
      lastname: user?.lastname,
      email: user?.email,
      success: user !== undefined,
    });
  }
}
