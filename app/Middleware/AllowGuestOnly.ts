import { GuardsList } from '@ioc:Adonis/Addons/Auth';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { AuthenticationException } from '@adonisjs/auth/build/standalone';

/**
 * This is actually a reverted a reverted auth middleware available in ./Auth.ts
 * provided by the AdonisJS project iself.
 */
export default class GuestMiddleware {
  /**
   * The URL to redirect to when request is authorized
   */
  protected redirectTo = '/dashboard';

  protected async authenticate(
    auth: HttpContextContract['auth'],
    guards: (keyof GuardsList)[],
  ) {
    let guardLastAttempted: string | undefined;

    for (const guard of guards) {
      guardLastAttempted = guard;

      // eslint-disable-next-line no-await-in-loop
      if (await auth.use(guard).check()) {
        auth.defaultGuard = guard;

        throw new AuthenticationException(
          'Unauthorized access',
          'E_UNAUTHORIZED_ACCESS',
          guardLastAttempted,
          this.redirectTo,
        );
      }
    }
  }

  /**
   * Handle request
   */
  public async handle(
    { auth }: HttpContextContract,
    next: () => Promise<void>,
    customGuards: (keyof GuardsList)[],
  ) {
    /**
     * Uses the user defined guards or the default guard mentioned in
     * the config file
     */
    const guards = customGuards.length > 0 ? customGuards : [auth.name];

    await this.authenticate(auth, guards);

    await next();
  }
}
