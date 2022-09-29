import { Exception } from '@adonisjs/core/build/standalone'

/*
|--------------------------------------------------------------------------
| Exception
|--------------------------------------------------------------------------
|
| The Exception class imported from `@adonisjs/core` allows defining
| a status code and error code for every exception.
|
| @example
| new ConnectionAttemptException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
export default class ConnectionAttemptException extends Exception {
  constructor () {
    super('Too many connection attempts ', 429, 'E_TOO_MANY_CONNECTION_ATTEMPTS')
  }
}
