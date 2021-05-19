/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class HandleDoubleSlash {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  // eslint-disable-next-line consistent-return
  async handle({ request, response }, next) {
    // Redirect requests that contain duplicate slashes to the right path
    if (request.url().includes('//')) {
      return response.redirect(
        request.url().replace(/\/{2,}/g, '/'),
      );
    }

    await next();
  }
}

module.exports = HandleDoubleSlash;
