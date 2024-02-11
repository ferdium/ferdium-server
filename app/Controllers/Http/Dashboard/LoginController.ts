import type { HttpContext } from '@adonisjs/core/http'
import { schema, rules, validator } from '@adonisjs/validator'
import User from '#app/Models/User'
import crypto from 'node:crypto'
import { handleVerifyAndReHash } from '../../../../helpers/PasswordHash.js'

export default class LoginController {
  /**
   * Display the login form
   */
  public async show({ view }: HttpContext) {
    return view.render('dashboard/login')
  }

  /**
   * Login a user
   */
  public async login({ request, response, auth, session }: HttpContext) {
    try {
      await validator.validate({
        schema: schema.create({
          mail: schema.string([rules.email(), rules.required()]),
          password: schema.string([rules.required()]),
        }),
        data: request.only(['mail', 'password']),
      })
    } catch {
      session.flash({
        type: 'danger',
        message: 'Invalid mail or password',
      })
      session.flashExcept(['password'])

      return response.redirect('/user/login')
    }

    try {
      const { mail, password } = request.all()

      // Check if user with email exists
      const user = await User.query().where('email', mail).first()
      if (!user?.email) {
        throw new Error('User credentials not valid (Invalid email)')
      }

      const hashedPassword = crypto.createHash('sha256').update(password).digest('base64')

      // Verify password
      let isMatchedPassword = false
      try {
        isMatchedPassword = await handleVerifyAndReHash(user, hashedPassword)
      } catch (error) {
        return response.internalServerError({ message: error.message })
      }

      if (!isMatchedPassword) {
        throw new Error('User credentials not valid (Invalid password)')
      }

      await auth.use('web').login(user)

      return response.redirect('/user/account')
    } catch {
      session.flash({
        type: 'danger',
        message: 'Invalid mail or password',
      })
      session.flashExcept(['password'])

      return response.redirect('/user/login')
    }
  }
}
