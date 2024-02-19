import env from '#start/env';
import { defineConfig } from '@adonisjs/core/logger';

export default defineConfig({
  default: 'app',

  loggers: {
    app: {
      enabled: true,
      name: env.get('APP_NAME', 'Ferdium-server'),
      level: env.get('LOG_LEVEL', 'info'),
    },
  },
});
