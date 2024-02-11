/*
|--------------------------------------------------------------------------
| Validating Environment Variables
|--------------------------------------------------------------------------
|
| In this file we define the rules for validating environment variables.
| By performing validation we ensure that your application is running in
| a stable environment with correct configuration values.
|
| This file is read automatically by the framework during the boot lifecycle
| and hence do not rename or move this file to a different location.
|
*/
import { Env } from '@adonisjs/core/env';

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring session package
  |----------------------------------------------------------
  */
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory'] as const),

  /*
  |----------------------------------------------------------
  | Variables for configuring the mail package
  |----------------------------------------------------------
  */
  // SMTP_HOST: Env.schema.string(),
  // SMTP_PORT: Env.schema.string(),
  // SES_ACCESS_KEY: Env.schema.string(),
  // SES_ACCESS_SECRET: Env.schema.string(),
  // SES_REGION: Env.schema.string(),
  // MAILGUN_API_KEY: Env.schema.string(),
  // MAILGUN_DOMAIN: Env.schema.string(),
  // SPARKPOST_API_KEY: Env.schema.string(),
});
