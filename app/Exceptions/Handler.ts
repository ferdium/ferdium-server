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

import logger from '@adonisjs/core/services/logger'
import { ExceptionHandler as AdonisExceptionHandler } from '@adonisjs/core/http'

export default class ExceptionHandler extends AdonisExceptionHandler {
  constructor() {
    super(logger)
  }
}
