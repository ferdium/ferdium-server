/**
 * Config source: https://git.io/JeYHp
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import env from '#start/env'
import { app } from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/session'

export default defineConfig({
  /*
  |--------------------------------------------------------------------------
  | Enable/Disable sessions
  |--------------------------------------------------------------------------
  |
  | Setting the following property to "false" will disable the session for the
  | entire application
  |
  */
  enabled: true,

  /*
  |--------------------------------------------------------------------------
  | Driver
  |--------------------------------------------------------------------------
  |
  | The session driver to use. You can choose between one of the following
  | drivers.
  |
  | - cookie (Uses signed cookies to store session values)
  | - file (Uses filesystem to store session values)
  | - redis (Uses redis. Make sure to install "@adonisjs/redis" as well)
  |
  | Note: Switching drivers will make existing sessions invalid.
  |
  */
  driver: env.get('SESSION_DRIVER', 'cookie'),

  /*
  |--------------------------------------------------------------------------
  | Cookie name
  |--------------------------------------------------------------------------
  |
  | The name of the cookie that will hold the session id.
  |
  */
  cookieName: 'adonis-session',

  /*
  |--------------------------------------------------------------------------
  | Clear session when browser closes
  |--------------------------------------------------------------------------
  |
  | Whether or not you want to destroy the session when browser closes. Setting
  | this value to `true` will ignore the `age`.
  |
  */
  clearWithBrowser: true,

  /*
  |--------------------------------------------------------------------------
  | Session age
  |--------------------------------------------------------------------------
  |
  | The duration for which session stays active after no activity. A new HTTP
  | request to the server is considered as activity.
  |
  | The value can be a number in milliseconds or a string that must be valid
  | as per https://npmjs.org/package/ms package.
  |
  | Example: `2 days`, `2.5 hrs`, `1y`, `5s` and so on.
  |
  */
  age: '2h',

  /*
  |--------------------------------------------------------------------------
  | Cookie values
  |--------------------------------------------------------------------------
  |
  | The cookie settings are used to setup the session id cookie and also the
  | driver will use the same values.
  |
  */
  cookie: {
    path: '/',
    httpOnly: true,
    sameSite: false,
  },

  /*
  |--------------------------------------------------------------------------
  | Configuration for the file driver
  |--------------------------------------------------------------------------
  |
  | The file driver needs absolute path to the directory in which sessions
  | must be stored.
  |
  */
  file: {
    location: app.tmpPath('sessions'),
  },

  /*
  |--------------------------------------------------------------------------
  | Redis driver
  |--------------------------------------------------------------------------
  |
  | The redis connection you want session driver to use. The same connection
  | must be defined inside `config/redis.ts` file as well.
  |
  */
  redisConnection: 'local',
})
