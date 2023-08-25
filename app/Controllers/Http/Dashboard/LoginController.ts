import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { schema, rules, validator } from '@ioc:Adonis/Core/Validator';
import crypto from 'node:crypto';

export default class LoginController {
  /**
   * Display the login form
   */
  public async show({ view }: HttpContextContract) {
    return view.render('dashboard/login');
  }

  /**
   * Login a user
   */
  public async login({
    request,
    response,
    auth,
    session,
  }: HttpContextContract) {
    try {
      await validator.validate({
        schema: schema.create({
          mail: schema.string([rules.email(), rules.required()]),
          password: schema.string([rules.required()]),
        }),
        data: request.only(['mail', 'password']),
      });
    } catch {
      session.flash({
        type: 'danger',
        message: 'Invalid mail or password',
      });
      session.flashExcept(['password']);

      return response.redirect('/user/login');
    }

    try {
      const { mail, password } = request.all();

      const hashedPassword = crypto
        .createHash('sha256')
        .update(password)
        .digest('base64');

      await auth.use('web').attempt(mail, hashedPassword);

      return response.redirect('/user/account');
    } catch {
      session.flash({
        type: 'danger',
        message: 'Invalid mail or password',
      });
      session.flashExcept(['password']);

      return response.redirect('/user/login');
    }
  }
}
