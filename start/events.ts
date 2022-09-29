import Event from '@ioc:Adonis/Core/Event'
import Env from '@ioc:Adonis/Core/Env'
import Mail from '@ioc:Adonis/Addons/Mail'

import Logger from '@ioc:Adonis/Core/Logger'
import Database from '@ioc:Adonis/Lucid/Database'
import Application from '@ioc:Adonis/Core/Application'

Event.on('db:query', (query) => {
  if (Application.inProduction) {
    Logger.debug('Query: ', query)
  } else {
    Database.prettyPrint(query)
  }
})

Event.on('forgot::password', async ({ user, token }) => {
  const body = `
Hello ${user.username},
we received a request to reset your Ferdium account password.
Use the link below to reset your password. If you didn't requested that your password be reset, please ignore this message.

${Env.get('APP_URL')}/user/reset?token=${encodeURIComponent(token)}

This message was sent automatically. Please do not reply.
`
  console.log('Sending message', body)
  try {
    await Mail.send((message) => {
      message.text(body)
      message.subject('[Ferdium] Reset your password')
      message.from(Env.get('MAIL_SENDER'))
      message.to(user.email)
    })
  } catch (e) {
    console.log(`Couldn't send mail: ${e}`)
  }
})

Event.on('signup::verifyEmail', async ({ user, url }) => {
  const body = `
Hello ${user.username},
to complete your registration please verify your account.

${Env.get('APP_URL')}${url}

This message was sent automatically. Please do not reply.
`
  try {
    await Mail.send((message) => {
      message.text(body)
      message.subject('[Ferdium] Verify account')
      message.from(Env.get('MAIL_SENDER'))
      message.to(user.email)
    })
  } catch (e) {
    console.log(`Couldn't send mail: ${e}`)
  }
})
