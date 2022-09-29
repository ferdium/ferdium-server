import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { CreateUserValidator } from 'App/Validators/UserValidators'
import UserService from 'App/Services/UserService'
import User from 'App/Models/User'
import VerificationProcedure from 'App/Models/VerificationProcedure'
import starterConfig from 'Config/starter'

export default class SignupController {
  public async signupForm ({ view }: HttpContextContract) {
    return view.render('pages/signup')
  }

  public async submitSignupForm ({
    request,
    response,
    session,
  }: HttpContextContract) {
    const payload = await request.validate(CreateUserValidator)
    const user = await UserService.create(payload)

    if (!starterConfig.signup.verifyEmail) {
      session.flash({
        notification: 'Your account has been created. You can log in.',
      })
      response.redirect('/')
    } else {
      session.put('tmpUser', user)
      response.redirect('/signup/check-your-inbox')
    }
  }

  public async checkYourInbox ({
    view,
    session,
    response,
  }: HttpContextContract) {
    const user = session.get('tmpUser')
    if (!user) {
      return response.forbidden()
    }
    return view.render('pages/SignUpCheckYourInbox', {
      user: session.get('tmpUser'),
    })
  }

  public async verifyEmail ({ view, params }: HttpContextContract) {
    const verificationProcedure = await VerificationProcedure.findOrFail(
      params.id,
    )
    const user = await User.findOrFail(verificationProcedure.userId)
    user.blocked = false
    user.emailVerified = true
    await user.save()

    await verificationProcedure.delete()
    return view.render('pages/verifyEmail', {})
  }
}
