/* eslint-disable @typescript-eslint/indent */
/**
 * Config source: https://git.io/JesV9
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import path from 'node:path';
import Env from '@ioc:Adonis/Core/Env';
import { DatabaseConfig } from '@ioc:Adonis/Lucid/Database';

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
      client: 'sqlite',
      connection: {
        filename: path.join(
          Env.get('DATA_DIR', 'data'),
          `${Env.get('DB_DATABASE', 'ferdium')}.sqlite`,
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
      debug: Env.get('DB_DEBUG', false),
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
        naturalSort: true,
      },
      healthCheck: false,
      debug: Env.get('DB_DEBUG', false),
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
        ssl: Env.get('DB_CA_CERT')
          ? {
              rejectUnauthorized: false,
              ca: Env.get('DB_CA_CERT'),
            }
          : JSON.parse(Env.get('DB_SSL', 'true')),
      },
      migrations: {
        naturalSort: true,
      },
      healthCheck: false,
      debug: Env.get('DB_DEBUG', false),
    },
  },
};

export default databaseConfig;
