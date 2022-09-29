import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UserService from 'App/Services/UserService'
import VerificationProcedureService from 'App/Services/VerificationProcedureService'
import User from 'App/Models/User'
import Route from '@ioc:Adonis/Core/Route'
import { ForgotPasswordValidator } from 'App/Validators/UserValidators'

export default class SendEmailVerificationController {
  public async emailForm ({ view }: HttpContextContract) {
    return view.render('pages/sendEmailVerification')
  }

  public async submitEmailForm ({
    request,
    response,
    session,
  }: HttpContextContract) {
    const user = await User.findBy('email', request.input('email'))
    if (!user) {
      session.flash({
        error: 'Sorry, we found no user found with this email.',
      })
      return response.redirect(Route.makeUrl('send-email-verification'))
    }

    await UserService.sendEmailVerification(user)

    session.flash({ notification: 'We sent you an email to verify your account. Please check your inbox' })

    response.redirect(Route.makeUrl('login'))
  }
}
