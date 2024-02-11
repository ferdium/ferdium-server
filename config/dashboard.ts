import env from '#start/env';

export const enabled: boolean = env.get('IS_DASHBOARD_ENABLED') !== 'false';

export const mailFrom: string = env.get('MAIL_SENDER');
