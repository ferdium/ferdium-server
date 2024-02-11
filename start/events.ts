import { Config } from '@adonisjs/core/config'
import emitter from '@adonisjs/core/services/emitter'
import mail from '@adonisjs/mail/services/main'

/*
|--------------------------------------------------------------------------
| Preloaded File
|--------------------------------------------------------------------------
|
| Any code written inside this file will be executed during the application
| boot.
|
*/
emitter.on('forgot::password', async ({ user, token }) => {
  try {
    // eslint-disable-next-line no-console
    console.log('Sending message')
    await mail.send((message) => {
      message
        .subject('[Ferdium] Forgot Password')
        .to(user.email)
        .from(Config.get('dasshboard.mailFrom'))
        .textView('emails.forgot-password', {
          appUrl: Config.get('app.url'),
          username: user.username,
          token,
        })
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`Couldn't send mail: ${error}`)
  }
})
