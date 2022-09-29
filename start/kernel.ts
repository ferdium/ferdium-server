import Server from '@ioc:Adonis/Core/Server'

/*
|--------------------------------------------------------------------------
| Global Middleware
|--------------------------------------------------------------------------
|
| Global middleware are executed on each http request only when the routes
| match.
|
*/
Server.middleware.register([
  () => import('@ioc:Adonis/Core/BodyParser'),
  () => import('@ioc:Adonis/Addons/Shield'),
  () => import('App/Middleware/HandleDoubleSlash'),
  () => import('App/Middleware/SilentAuth'),
])

/*
|--------------------------------------------------------------------------
| Named Middleware
|--------------------------------------------------------------------------
|
| Named middleware is key/value object to conditionally add middleware on
| specific routes or group of routes.
|
| // define
| {
|   auth: 'Adonis/Middleware/Auth'
| }
|
| // use
| Route.get().middleware('auth')
|
*/
Server.middleware.registerNamed({
  auth: () => import('App/Middleware/Auth'),
  guest: () => import('App/Middleware/Guest'),
  roles: () => import('App/Middleware/Role'),
  connectionAttempt: () => import('App/Middleware/ConnectionAttempt'),
})
