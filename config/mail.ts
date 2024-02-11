/**
 * Config source: https://git.io/JvgAf
 *
 * Feel free to let us know via PR, if you find something broken in this contract
 * file.
 */

import env from '#start/env'
import { defineConfig } from '@adonisjs/mail'

export default defineConfig({
  /*
  |--------------------------------------------------------------------------
  | Default mailer
  |--------------------------------------------------------------------------
  |
  | The following mailer will be used to send emails, when you don't specify
  | a mailer
  |
  */
  mailer: env.get('MAIL_CONNECTION', 'smtp'),

  /*
  |--------------------------------------------------------------------------
  | Mailers
  |--------------------------------------------------------------------------
  |
  | You can define or more mailers to send emails from your application. A
  | single `driver` can be used to define multiple mailers with different
  | config.
  |
  | For example: Postmark driver can be used to have different mailers for
  | sending transactional and promotional emails
  |
  */
  mailers: {
    /*
    |--------------------------------------------------------------------------
    | Smtp
    |--------------------------------------------------------------------------
    |
    | Uses SMTP protocol for sending email
    |
    */
    smtp: drivers.smtp({
      name: env.get('APP_URL'),
      port: env.get('SMTP_PORT', '2525'),
      host: env.get('SMTP_HOST', 'localhost'),
      secure: JSON.parse(env.get('MAIL_SSL', 'false')),
      requireTLS: JSON.parse(env.get('MAIL_REQUIRE_TLS', 'false')),
      auth: {
        user: env.get('MAIL_USERNAME'),
        pass: env.get('MAIL_PASSWORD'),
        type: 'login',
      },
      maxConnections: 5,
      maxMessages: 100,
      rateLimit: 10,
    }),

    /*
    |--------------------------------------------------------------------------
    | SES
    |--------------------------------------------------------------------------
    |
    | Uses Amazon SES for sending emails. You will have to install the aws-sdk
    | when using this driver.
    |
    | ```
    | npm i aws-sdk
    | ```
    |
    */
    ses: drivers.ses({
      apiVersion: '2010-12-01',
      key: env.get('SES_ACCESS_KEY'),
      secret: env.get('SES_ACCESS_SECRET'),
      region: env.get('SES_REGION'),
      sslEnabled: true,
      sendingRate: 10,
      maxConnections: 5,
    }),

    /*
    |--------------------------------------------------------------------------
    | Mailgun
    |--------------------------------------------------------------------------
    |
        | Uses Mailgun service for sending emails.
    |
    | If you are using an EU domain. Ensure to change the baseUrl to hit the
    | europe endpoint (https://api.eu.mailgun.net/v3).
    |
    */
    mailgun: drivers.mailgun({
      baseUrl: 'https://api.mailgun.net/v3',
      key: env.get('MAILGUN_API_KEY'),
      domain: env.get('MAILGUN_DOMAIN'),
    }),

    /*
    |--------------------------------------------------------------------------
    | SparkPost
    |--------------------------------------------------------------------------
    |
        | Uses Sparkpost service for sending emails.
    |
    */
    sparkpost: drivers.sparkpost({
      baseUrl: 'https://api.sparkpost.com/api/v1',
      key: env.get('SPARKPOST_API_KEY'),
    }),
  },
})

declare module '@adonisjs/mail/types' {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}
