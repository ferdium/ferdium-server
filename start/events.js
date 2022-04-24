const Event = use('Event');
const Mail = use('Mail');
const Env = use('Env');

Event.on('forgot::password', async ({ user, token }) => {
  const body = `
Hello ${user.username},
we received a request to reset your Ferdium account password.
Use the link below to reset your password. If you didn't requested that your password be reset, please ignore this message.

${Env.get('APP_URL')}/user/reset?token=${encodeURIComponent(token)}

This message was sent automatically. Please do not reply.
`;
  console.log('Sending message', body);
  try {
    await Mail.raw(body, (message) => {
      message.subject('[Ferdium] Reset your password');
      message.from(Env.get('MAIL_SENDER'));
      message.to(user.email);
    });
  } catch (e) {
    console.log(`Couldn't send mail: ${e}`);
  }
});
