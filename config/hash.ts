/**
 * Config source: https://git.io/JfefW
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import env from '#start/env';
import { defineConfig, drivers } from '@adonisjs/core/hash';

/*
|--------------------------------------------------------------------------
| Hash Config
|--------------------------------------------------------------------------
|
| The `HashConfig` relies on the `HashList` interface which is
| defined inside `contracts` directory.
|
*/
export default defineConfig({
  /*
  |--------------------------------------------------------------------------
  | Default hasher
  |--------------------------------------------------------------------------
  |
  | By default we make use of the argon hasher to hash values. However, feel
  | free to change the default value
  |
  | Default is set to bcrypt to prevent breaking-changes.
  */
  default: env.get('HASH_DRIVER', 'scrypt'),

  list: {
    scrypt: drivers.scrypt({
      cost: 16_384,
      blockSize: 8,
      parallelization: 1,
      saltSize: 16,
      keyLength: 64,
      maxMemory: 32 * 1024 * 1024,
    }),
    /*
    |--------------------------------------------------------------------------
    | Argon
    |--------------------------------------------------------------------------
    |
    | Argon mapping uses the `argon2` driver to hash values.
    |
    | Make sure you install the underlying dependency for this driver to work.
    | https://www.npmjs.com/package/phc-argon2.
    |
    | npm install phc-argon2
    |
    */
    argon: drivers.argon2({
      variant: 'id',
      iterations: 3,
      memory: 4096,
      parallelism: 1,
      saltSize: 16,
    }),

    /*
    |--------------------------------------------------------------------------
    | Bcrypt
    |--------------------------------------------------------------------------
    |
    | Bcrypt mapping uses the `bcrypt` driver to hash values.
    |
    | Make sure you install the underlying dependency for this driver to work.
    | https://www.npmjs.com/package/phc-bcrypt.
    |
    | npm install phc-bcrypt
    |
    */
    bcrypt: drivers.bcrypt({
      rounds: 10,
    }),

    legacy: {
      // @ts-expect-error
      driver: 'legacy',
    },
  },
});
