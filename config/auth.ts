import { AuthConfig } from '@ioc:Adonis/Addons/Auth'

const authConfig: AuthConfig = {
  guard: 'web',
  guards: {
    web: {
      driver: 'session',
      provider: {
        driver: 'lucid',
        identifierKey: 'id',
        uids: ['email','username'],
        model: () => import('App/Models/User'),
      },
    },
    api: {
      driver: 'oat',
      tokenProvider: {
        type: 'api',
        driver: 'database',
        table: 'tokens',
        foreignKey: 'user_id',
      },
      provider: {
        driver: 'lucid',
        identifierKey: 'id',
        uids: ['email', 'username'],
        model: () => import('App/Models/User'),
      },
    },
    basic: {
      driver: 'basic',
      realm: 'Login',
      provider: {
        driver: 'lucid',
        identifierKey: 'id',
        uids: ['email', 'username'],
        model: () => import('App/Models/User'),
      },
    },
  },
}

export default authConfig
