import { SentryConfig } from '@ioc:Adonis/Addons/Sentry'
import Env from '@ioc:Adonis/Core/Env'

export const sentryConfig: SentryConfig = {
  enabled: true,
  debug: Env.get('APP_DEBUG', false),
  dsn: Env.get('SENTRY_DSN'),
  release: Env.get('npm_package_version'),
}

export default sentryConfig
