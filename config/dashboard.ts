import Env from '@ioc:Adonis/Core/Env';

export const enabled: boolean = Env.get('IS_DASHBOARD_ENABLED') !== 'false';

export const mailFrom: string = Env.get('MAIL_SENDER');
