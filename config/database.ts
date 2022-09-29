/**
 * Config source: https://git.io/JesV9
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import Env from '@ioc:Adonis/Core/Env'
import { DatabaseConfig } from '@ioc:Adonis/Lucid/Database'
import path from 'path'

const databaseConfig: DatabaseConfig = {
  /*
  |--------------------------------------------------------------------------
  | Connection
  |--------------------------------------------------------------------------
  |
  | The primary connection for making database queries across the application
  | You can use any key from the `connections` object defined in this same
  | file.
  |
  */
  connection: Env.get('DB_CONNECTION', 'sqlite'),

  connections: {
    /*
    |--------------------------------------------------------------------------
    | SQLite
    |--------------------------------------------------------------------------
    |
    | Configuration for the SQLite database.  Make sure to install the driver
    | from npm when using this connection
    |
    | npm i sqlite3
    |
    */
    sqlite: {
      client: 'sqlite3',
      connection: {
        filename: path.join(
          Env.get('DATA_DIR', 'data'),
          `${Env.get('DB_DATABASE', 'ferdium')}.sqlite`,
        ),
      },
      migrations: {
        tableName: 'migrations',
      },
      useNullAsDefault: true,
      debug: Env.get('DB_DEBUG', false),
      healthCheck: Env.get('DB_CONNECTION', 'sqlite') === 'sqlite', // 👈 enabled
    },

    /*
    |--------------------------------------------------------------------------
    | MySQL config
    |--------------------------------------------------------------------------
    |
    | Configuration for MySQL database. Make sure to install the driver
    | from npm when using this connection
    |
    | npm i mysql
    |
    */
    mysql: {
      client: 'mysql',
      connection: {
        host: Env.get('DB_HOST', 'localhost'),
        port: Env.get('DB_PORT', ''),
        user: Env.get('DB_USER', 'root'),
        password: Env.get('DB_PASSWORD', ''),
        database: Env.get('DB_DATABASE', 'ferdium'),
      },
      migrations: {
        tableName: 'migrations',
      },
      debug: Env.get('DB_DEBUG', false),
      healthCheck: Env.get('DB_CONNECTION', 'sqlite') === 'mysql', // 👈 enabled
    },

    /*
    |--------------------------------------------------------------------------
    | PostgreSQL config
    |--------------------------------------------------------------------------
    |
    | Configuration for PostgreSQL database. Make sure to install the driver
    | from npm when using this connection
    |
    | npm i pg
    |
    */
    pg: {
      client: 'pg',
      connection: {
        host: Env.get('DB_HOST', 'localhost'),
        port: Env.get('DB_PORT', ''),
        user: Env.get('DB_USER', 'root'),
        password: Env.get('DB_PASSWORD', ''),
        database: Env.get('DB_DATABASE', 'ferdium'),
      },
      migrations: {
        tableName: 'migrations',
      },
      debug: Env.get('DB_DEBUG', false),
      healthCheck: Env.get('DB_CONNECTION', 'sqlite') === 'pg', // 👈 enabled
    },
  },
}

export default databaseConfig
