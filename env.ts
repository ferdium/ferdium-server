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

import Env from '@ioc:Adonis/Core/Env'

export default Env.rules({
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  SITE_URL: Env.schema.string(),
  SITE_NAME: Env.schema.string(),
  APP_KEY: Env.schema.string(),
  APP_NAME: Env.schema.string(),
  APP_DEBUG: Env.schema.boolean.optional(),
  NODE_ENV: Env.schema.enum(['development', 'production', 'testing'] as const),
  EMAIL_FROM: Env.schema.string(),
  DRIVE_DISK: Env.schema.enum(['local', 's3'] as const),
  MAIL_DRIVER: Env.schema.enum(['smtp', 'mailhog' /* 'mailgun', 'sparkpost' */] as const),
  SMTP_HOST: Env.schema.string({ format: 'host' }),
  SMTP_PORT: Env.schema.number(),
  SMTP_USERNAME: Env.schema.string(),
  SMTP_PASSWORD: Env.schema.string(),
  // ### Variables for the SES driver
  // SES_ACCESS_KEY: Env.schema.string(),
  // SES_ACCESS_SECRET: Env.schema.string(),
  // SES_REGION: Env.schema.string(),
  // ### Variables for the Mailgun driver
  // MAILGUN_API_KEY: Env.schema.string(),
  // MAILGUN_DOMAIN: Env.schema.string(),
  // ### Variables for the Sparkpost driver
  // SPARKPOST_API_KEY: Env.schema.string(),
  // ### Variables for S3,
  S3_KEY: Env.schema.string(),
  S3_SECRET: Env.schema.string(),
  S3_BUCKET: Env.schema.string(),
  S3_REGION: Env.schema.string(),
  S3_ENDPOINT: Env.schema.string.optional(),

  SESSION_DRIVER: Env.schema.string(),
  SENTRY_DSN: Env.schema.string.optional(),

  // https://docs.adonisjs.com/cookbooks/using-ally-with-api-guard
  GITHUB_CLIENT_ID: Env.schema.string(),
  GITHUB_CLIENT_SECRET: Env.schema.string(),
})
