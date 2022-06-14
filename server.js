const Sentry = require('@sentry/node');

Sentry.init({ dsn: 'https://fe581d50b11842b68b8e43e08b9c6ad9@o1288292.ingest.sentry.io/6504914' });

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
