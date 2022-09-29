/**
 * Config source: https://git.io/JvgAf
 *
 * Feel free to let us know via PR, if you find something broken in this contract
 * file.
 */

import Env from '@ioc:Adonis/Core/Env'
import { mailConfig } from '@adonisjs/mail/build/config'

export default mailConfig({
  /*
  |--------------------------------------------------------------------------
  | Default mailer
  |--------------------------------------------------------------------------
  |
  | The following mailer will be used to send emails, when you don't specify
  | a mailer
  |
  */
  mailer: Env.get('MAIL_DRIVER', 'smtp'),

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
    smtp: {
      driver: 'smtp',
      pool: true,
      port: Env.get('SMTP_PORT', '2525'),
      host: Env.get('SMTP_HOST', 'localhost'),
      secure: JSON.parse(Env.get('MAIL_SSL', 'false')),
      requireTLS: JSON.parse(Env.get('MAIL_REQUIRE_TLS', 'false')),
      auth: {
        user: Env.get('MAIL_USERNAME'),
        pass: Env.get('MAIL_PASSWORD'),
        type: 'login',
      },
      maxConnections: 5,
      maxMessages: 100,
      rateLimit: 10,
    },

    mailhog: {
      driver: 'smtp',
      port: Env.get('SMTP_PORT', '1025'),
      host: Env.get('SMTP_HOST', 'localhost'),
      secure: false,
      requireTLS: false,
      auth: {
        user: Env.get('SMTP_USERNAME', ''),
        pass: Env.get('SMTP_PASSWORD', ''),
        type: 'login',
      },
      maxConnections: 5,
      maxMessages: 100,
      rateLimit: 10,
    },

    /*
    |--------------------------------------------------------------------------
    | SparkPost
    |--------------------------------------------------------------------------
    |
    | Here we define configuration for spark post. Extra options can be defined
    | inside the `extra` object.
    |
    | https://developer.sparkpost.com/api/transmissions.html#header-options-attributes
    |
    | extras: {
    |   campaign_id: 'sparkpost campaign id',
    |   options: { // sparkpost options }
    | }
    |
    */
    sparkpost: {
      driver: 'sparkpost',
      baseUrl: '',
      key: Env.get('SPARKPOST_API_KEY'),
    },

    /*
    |--------------------------------------------------------------------------
    | Mailgun
    |--------------------------------------------------------------------------
    |
    | Here we define configuration for mailgun. Extra options can be defined
    | inside the `extra` object.
    |
    | https://mailgun-documentation.readthedocs.io/en/latest/api-sending.html#sending
    |
    | extras: {
    |   'o:tag': '',
    |   'o:campaign': '',,
    |   . . .
    | }
    |
    */
    mailgun: {
      driver: 'mailgun',
      baseUrl: '',
      domain: Env.get('MAILGUN_DOMAIN'),
      // region: Env.get('MAILGUN_API_REGION'),
      key: Env.get('MAILGUN_API_KEY'),
    },
  },
})
