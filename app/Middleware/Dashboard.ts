import type { HttpContext } from '@adonisjs/core/http';
import { Config } from '@adonisjs/core/config';

export default class Dashboard {
  public async handle({ response }: HttpContext, next: () => Promise<void>) {
    if (Config.get('dashboard.enabled') === false) {
      response.send(
        'The user dashboard is disabled on this server\n\nIf you are the server owner, please set IS_DASHBOARD_ENABLED to true to enable the dashboard.',
      );
    } else {
      await next();
    }
  }
}
