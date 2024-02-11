import env from '#start/env';
import { defineConfig, transports } from '@adonisjs/mail';

const mailConfig = defineConfig({
  default: 'smtp',

  /**
   * The mailers object can be used to configure multiple mailers
   * each using a different transport or same transport with different
   * options.
   */
  mailers: {
    smtp: transports.smtp({
      port: env.get('SMTP_PORT', '2525'),
      host: env.get('SMTP_HOST', 'localhost'),
      secure: JSON.parse(env.get('MAIL_SSL', 'false')),
      requireTLS: JSON.parse(env.get('MAIL_REQUIRE_TLS', 'false')),
      auth: {
        user: env.get('MAIL_USERNAME')!,
        pass: env.get('MAIL_PASSWORD')!,
        type: 'login',
      },
      maxConnections: 5,
      maxMessages: 100,
    }),

    ses: transports.ses({
      apiVersion: '2010-12-01',
      credentials: {
        accessKeyId: env.get('SES_ACCESS_KEY')!,
        secretAccessKey: env.get('SES_ACCESS_SECRET')!,
      },
      region: process.env.SES_REGION!,
      sendingRate: 10,
      maxConnections: 5,
    }),

    mailgun: transports.mailgun({
      baseUrl: 'https://api.mailgun.net/v3',
      key: env.get('MAILGUN_API_KEY')!,
      domain: env.get('MAILGUN_DOMAIN')!,
    }),

    sparkpost: transports.sparkpost({
      baseUrl: 'https://api.sparkpost.com/api/v1',
      key: env.get('SPARKPOST_API_KEY')!,
    }),
  },
});

export default mailConfig;

declare module '@adonisjs/mail/types' {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}
