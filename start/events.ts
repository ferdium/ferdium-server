import emitter from '@adonisjs/core/services/emitter';
import mail from '@adonisjs/mail/services/main';
import config from '@adonisjs/core/services/config';

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
    console.log('Sending message');
    await mail.send(message => {
      message
        .subject('[Ferdium] Forgot Password')
        .to(user.email)
        .from(config.get('dasshboard.mailFrom'))
        .textView('emails.forgot-password', {
          appUrl: config.get('app.url'),
          username: user.username,
          token,
        });
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`Couldn't send mail: ${error}`);
  }
});
