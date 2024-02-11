/**
 * Config source: https://git.io/JesV9
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import path from 'node:path';
import env from '#start/env';
import { DatabaseConfig } from '@adonisjs/lucid/database';
import { defineConfig } from '@adonisjs/lucid';

const databaseConfig = defineConfig({
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
  connection: env.get('DB_CONNECTION', 'sqlite'),

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
      client: 'sqlite',
      connection: {
        filename: path.join(
          env.get('DATA_DIR', 'data'),
          `${env.get('DB_DATABASE', 'ferdium')}.sqlite`,
        ),
      },
      pool: {
        afterCreate: (conn, cb) => {
          conn.run('PRAGMA foreign_keys=true', cb);
        },
      },
      migrations: {
        naturalSort: true,
      },
      useNullAsDefault: true,
      healthCheck: false,
      debug: env.get('DB_DEBUG', false),
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
        host: env.get('DB_HOST', 'localhost'),
        port: env.get('DB_PORT', ''),
        user: env.get('DB_USER', 'root'),
        password: env.get('DB_PASSWORD', ''),
        database: env.get('DB_DATABASE', 'ferdium'),
      },
      migrations: {
        naturalSort: true,
      },
      healthCheck: false,
      debug: env.get('DB_DEBUG', false),
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
        host: env.get('DB_HOST', 'localhost'),
        port: env.get('DB_PORT', ''),
        user: env.get('DB_USER', 'root'),
        password: env.get('DB_PASSWORD', ''),
        database: env.get('DB_DATABASE', 'ferdium'),
        ssl: env.get('DB_CA_CERT')
          ? {
              rejectUnauthorized: false,
              ca: env.get('DB_CA_CERT'),
            }
          : JSON.parse(env.get('DB_SSL', 'true')),
      },
      migrations: {
        naturalSort: true,
      },
      healthCheck: false,
      debug: env.get('DB_DEBUG', false),
    },
  },
});

export default databaseConfig;
