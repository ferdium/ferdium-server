import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ConnectionAttemptService from '@ioc:App/ConnectionAttemptService'
import ConnectionAttemptException from 'App/Exceptions/ConnectionAttemptException'

export default class ConnectionAttempt {
  public async handle ({ request, session, response }: HttpContextContract, next: () => Promise<void>) {
    try {
      ConnectionAttemptService.check(request)
    } catch (e) {
      if (e instanceof ConnectionAttemptException) {
        session.flash({ error: 'Max connection attempts reached.' })
        response.redirect().back()
      }
    }
    await next()
  }
}
