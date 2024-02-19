/**
 * Config source: https://git.io/JfefZ
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import proxyAddr from 'proxy-addr';
import env from '#start/env';
import { ValidatorConfig } from '@adonisjs/validator/types';
import { defineConfig } from '@adonisjs/core/http';

/*
|--------------------------------------------------------------------------
| Application secret key
|--------------------------------------------------------------------------
|
| The secret to encrypt and sign different values in your application.
| Make sure to keep the `APP_KEY` as an environment variable and secure.
|
| Note: Changing the application key for an existing app will make all
| the cookies invalid and also the existing encrypted data will not
| be decrypted.
|
*/
export const appKey: string = env.get('APP_KEY');

export const url = env.get('APP_URL');

// TODO: this is parsed as string to be coherent with the previous version of the code we add (before migrating to AdonisJS 5)
export const isRegistrationEnabled = env.get('IS_REGISTRATION_ENABLED');
export const connectWithFranz = env.get('CONNECT_WITH_FRANZ');
export const isCreationEnabled = env.get('IS_CREATION_ENABLED');
export const jwtUsePEM: boolean =
  env.get('JWT_USE_PEM', false) ||
  (env.get('JWT_PUBLIC_KEY', '') !== '' &&
    env.get('JWT_PRIVATE_KEY', '') !== '');
/*
|--------------------------------------------------------------------------
| Http server configuration
|--------------------------------------------------------------------------
|
| The configuration for the HTTP(s) server. Make sure to go through all
| the config properties to make keep server secure.
|
*/
export const http = defineConfig({
  /*
  |--------------------------------------------------------------------------
  | Allow method spoofing
  |--------------------------------------------------------------------------
  |
  | Method spoofing enables defining custom HTTP methods using a query string
  | `_method`. This is usually required when you are making traditional
  | form requests and wants to use HTTP verbs like `PUT`, `DELETE` and
  | so on.
  |
  */
  allowMethodSpoofing: false,

  /*
  |--------------------------------------------------------------------------
  | Subdomain offset
  |--------------------------------------------------------------------------
  */
  subdomainOffset: 2,

  /*
  |--------------------------------------------------------------------------
  | Request Ids
  |--------------------------------------------------------------------------
  |
  | Setting this value to `true` will generate a unique request id for each
  | HTTP request and set it as `x-request-id` header.
  |
  */
  generateRequestId: false,

  /*
  |--------------------------------------------------------------------------
  | Trusting proxy servers
  |--------------------------------------------------------------------------
  |
  | Define the proxy servers that AdonisJs must trust for reading `X-Forwarded`
  | headers.
  |
  */
  trustProxy: proxyAddr.compile('loopback'),

  /*
  |--------------------------------------------------------------------------
  | Generating Etag
  |--------------------------------------------------------------------------
  |
  | Whether or not to generate an etag for every response.
  |
  */
  etag: false,

  /*
  |--------------------------------------------------------------------------
  | JSONP Callback
  |--------------------------------------------------------------------------
  */
  jsonpCallbackName: 'callback',

  /*
  |--------------------------------------------------------------------------
  | Cookie settings
  |--------------------------------------------------------------------------
  */
  cookie: {
    domain: '',
    path: '/',
    maxAge: '2h',
    httpOnly: true,
    secure: false,
    sameSite: false,
  },
});

/*
|--------------------------------------------------------------------------
| Profiler
|--------------------------------------------------------------------------
*/
export const profiler = {
  /*
  |--------------------------------------------------------------------------
  | Toggle profiler
  |--------------------------------------------------------------------------
  |
  | Enable or disable profiler
  |
  */
  enabled: true,

  /*
  |--------------------------------------------------------------------------
  | Blacklist actions/row labels
  |--------------------------------------------------------------------------
  |
  | Define an array of actions or row labels that you want to disable from
  | getting profiled.
  |
  */
  blacklist: [],

  /*
  |--------------------------------------------------------------------------
  | Whitelist actions/row labels
  |--------------------------------------------------------------------------
  |
  | Define an array of actions or row labels that you want to whitelist for
  | the profiler. When whitelist is defined, then `blacklist` is ignored.
  |
  */
  whitelist: [],
};

/*
|--------------------------------------------------------------------------
| Validator
|--------------------------------------------------------------------------
|
| Configure the global configuration for the validator. Here's the reference
| to the default config https://git.io/JT0WE
|
*/
export const validator: ValidatorConfig = {};
