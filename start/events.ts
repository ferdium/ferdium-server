import Config from '@ioc:Adonis/Core/Config';
import Event from '@ioc:Adonis/Core/Event';
import Mail from '@ioc:Adonis/Addons/Mail';

/*
|--------------------------------------------------------------------------
| Preloaded File
|--------------------------------------------------------------------------
|
| Any code written inside this file will be executed during the application
| boot.
|
*/
Event.on('forgot::password', async ({ user, token }) => {
  try {
    // eslint-disable-next-line no-console
    console.log('Sending message');
    await Mail.send(message => {
      message
        .subject('[Ferdium] Forgot Password')
        .to(user.email)
        .from(Config.get('dasshboard.mailFrom'))
        .textView('emails.forgot-password', {
          appUrl: Config.get('app.url'),
          username: user.username,
          token,
        });
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`Couldn't send mail: ${error}`);
  }
});
