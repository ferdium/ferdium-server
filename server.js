const Sentry = require('@sentry/node');

Sentry.init({ dsn: 'https://34e9a42c1de24048b7bfc980211dd7c8@sentry.io/1838449' });

/*
|--------------------------------------------------------------------------
| Http server
|--------------------------------------------------------------------------
|
| This file bootstraps Adonisjs to start the HTTP server. You are free to
| customize the process of booting the http server.
|
| """ Loading ace commands """
|     At times you may want to load ace commands when starting the HTTP server.
|     Same can be done by chaining `loadCommands()` method after
|
| """ Preloading files """
|     Also you can preload files by calling `preLoad('path/to/file')` method.
|     Make sure to pass a relative path from the project root.
*/

const { Ignitor } = require('@adonisjs/ignitor');
const fold = require('@adonisjs/fold');

new Ignitor(fold)
  .appRoot(__dirname)
  .fireHttpServer()
  .catch(console.error); // eslint-disable-line no-console
