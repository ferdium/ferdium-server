'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

// Health: Returning if all systems function correctly
Route.get('health', ({
  response
}) => {
  return response.send({
    api: 'success',
    db: 'success'
  })
})

// API is grouped under '/v1/' route
Route.group(() => {
  // User authentification
  Route.post('auth/signup', 'UserController.signup').middleware('guest')
  Route.post('auth/login', 'UserController.login').middleware('guest')

  // User info
  Route.get('me', 'UserController.me').middleware('auth')

  // Service/recipe info
  Route.post('service', 'ServiceController.create').middleware('auth')
  Route.get('me/services', 'ServiceController.list').middleware('auth')
  Route.get('recipes/download/:recipe', 'ServiceController.download')

  // Static responses
  Route.get('features', 'StaticController.features');
  Route.get('services', 'StaticController.emptyArray')
  Route.get('workspace', 'StaticController.emptyArray')
  Route.get('news', 'StaticController.emptyArray')
  Route.get('payment/plans', 'StaticController.plans')
  Route.get('recipes/popular', 'StaticController.popularRecipes')
  Route.get('recipes/update', 'StaticController.emptyArray')
  // Route.get('announcements/:version', 'StaticController.announcement')
}).prefix('v1')

Route.get('/', () => {
  return {
    info: 'Franz Unofficial Server',
    version: '1.0.0',
    author: 'vantezzen',
    repo: 'https://github.com/vantezzen/franz-server'
  }
})
