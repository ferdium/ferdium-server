import { GuardsList } from '@ioc:Adonis/Addons/Auth';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { AuthenticationException } from '@adonisjs/auth/build/standalone';
import * as jose from 'jose';
import { appKey, jwtUsePEM } from 'Config/app';
import User from 'App/Models/User';

/**
 * Auth middleware is meant to restrict un-authenticated access to a given route
 * or a group of routes.
 *
 * You must register this middleware inside `start/kernel.ts` file under the list
 * of named middleware.
 */
export default class AuthMiddleware {
  /**
   * The URL to redirect to when request is Unauthorized
   */
  protected redirectTo = '/user/login';

  /**
   * Authenticates the current HTTP request against a custom set of defined
   * guards.
   *
   * The authentication loop stops as soon as the user is authenticated using any
   * of the mentioned guards and that guard will be used by the rest of the code
   * during the current request.
   */
  protected async authenticate(
    auth: HttpContextContract['auth'],
    guards: (keyof GuardsList)[],
    request: HttpContextContract['request'],
  ) {
    /**
     * Hold reference to the guard last attempted within the for loop. We pass
     * the reference of the guard to the "AuthenticationException", so that
     * it can decide the correct response behavior based upon the guard
     * driver
     */
    let guardLastAttempted: string | undefined;

    for (const guard of guards) {
      guardLastAttempted = guard;

      // eslint-disable-next-line no-await-in-loop
      if (await auth.use(guard).check()) {
        /**
         * Instruct auth to use the given guard as the default guard for
         * the rest of the request, since the user authenticated
         * succeeded here
         */
        auth.defaultGuard = guard;
        return;
      }
    }

    // Manually try authenticating using the JWT (verfiy signature required)
    // Legacy support for JWTs so that the client still works (older than 2.0.0)
    const authToken = request.headers().authorization?.split(' ')[1];
    if (authToken) {
      const jwt = await jose.jwtVerify(
        authToken,
        new TextEncoder().encode(jwtUsePEM ? '' : appKey),
      );
      const { uid } = jwt.payload;

      try {
        // @ts-expect-error
        request.user = await User.findOrFail(uid);
        return;
      } catch {
        // Silent fail to allow the rest of the code to handle the error
      }
    }

    /**
     * Unable to authenticate using any guard
     */
    throw new AuthenticationException(
      'Unauthorized access',
      'E_UNAUTHORIZED_ACCESS',
      guardLastAttempted,
      this.redirectTo,
    );
  }

  /**
   * Handle request
   */
  public async handle(
    { request, auth, response }: HttpContextContract,
    next: () => Promise<void>,
    customGuards: (keyof GuardsList)[],
  ) {
    /**
     * Uses the user defined guards or the default guard mentioned in
     * the config file
     */
    const guards = customGuards.length > 0 ? customGuards : [auth.name];
    try {
      await this.authenticate(auth, guards, request);
    } catch (error) {
      // If the user is not authenticated and it is a web endpoint, redirect to the login page
      if (guards.includes('web')) {
        return response.redirect(error.redirectTo);
      }
      throw error;
    }
    await next();
  }
}
