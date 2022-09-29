/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| AdonisJs will forward all exceptions occurred during an HTTP request to
| the following class. You can learn more about exception handling by
| reading docs.
|
| The exception handler extends a base `HttpExceptionHandler` which is not
| mandatory, however it can do lot of heavy lifting to handle the errors
| properly.
|
*/

import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Sentry from '@ioc:Adonis/Addons/Sentry'
import { AuthenticationException } from '@adonisjs/auth/build/standalone'
import { ValidationExceptionContract } from '@ioc:Adonis/Core/Validator'

export default class ExceptionHandler extends HttpExceptionHandler {
  protected statusPages = {
    '403': 'errors/unauthorized',
    '404': 'errors/not-found',
    '500..599': 'errors/server-error',
  }

  constructor () {
    super(Logger)
  }

  /**
   * Handle exception thrown during the HTTP lifecycle
   *
   * @method handle
   *
   * @param  {Object} error
   * @param  {Object} options.request
   * @param  {Object} options.response
   *
   * @return {void}
   */
  public async handle (error: any, ctx: HttpContextContract): Promise<void> {
    console.error('Handling error for request:', error, ctx.request.url())
    if (error.name === 'ValidationException') {
      const err = error as InstanceType<ValidationExceptionContract>
      return err.handle(err, ctx)
      // return ctx.response.status(400).send('Invalid arguments');
    }
    if (error.name === 'InvalidSessionException') {
      return ctx.response.status(401).redirect('/user/login')
    }
    if (error.name === 'AuthenticationException') {
      const err = error as AuthenticationException
      return ctx.response.redirect(err.redirectTo)
    }

    return ctx.response.status(error.status).send(error.message)
  }

  /**
   * Report exception for logging or debugging.
   *
   * @method report
   *
   * @param  {any} error
   * @param  {any} options.request
   *
   * @return {void}
   */
  public async report (error: any): Promise<boolean> {
    Sentry.captureException(error)
    return true
  }
}
