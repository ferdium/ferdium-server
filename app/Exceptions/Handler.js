const BaseExceptionHandler = use('BaseExceptionHandler');
const Sentry = require('@sentry/node');

/**
 * This class handles all exceptions thrown during
 * the HTTP request lifecycle.
 *
 * @class ExceptionHandler
 */
class ExceptionHandler extends BaseExceptionHandler {
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
  async handle(error, { response }) {
    if (error.name === 'ValidationException') {
      return response.status(400).send('Invalid arguments');
    }
    if (error.name === 'InvalidSessionException') {
      return response.status(401).redirect('/user/login');
    }

    return response.status(error.status).send(error.message);
  }

  /**
   * Report exception for logging or debugging.
   *
   * @method report
   *
   * @param  {Object} error
   * @param  {Object} options.request
   *
   * @return {void}
   */
  async report(error) {
    Sentry.captureException(error);
    return true;
  }
}

module.exports = ExceptionHandler;
