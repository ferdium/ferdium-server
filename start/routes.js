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

  // Service info
  Route.post('service', 'ServiceController.create').middleware('auth')
  Route.put('service/:id', 'ServiceController.edit').middleware('auth')
  Route.get('me/services', 'ServiceController.list').middleware('auth')
  Route.put('service/reorder', 'ServiceController.reorder').middleware('auth')
  Route.get('recipe', 'ServiceController.list').middleware('auth')
  Route.post('recipes/update', 'ServiceController.update').middleware('auth')
  
  // Recipe store
  Route.get('recipes', 'RecipeController.list')
  Route.get('recipes/download/:recipe', 'RecipeController.download')
  Route.get('recipes/search', 'RecipeController.search')
  Route.get('recipes/popular', 'StaticController.popularRecipes')
  Route.get('recipes/update', 'StaticController.emptyArray')

  // Workspaces
  Route.put('workspace/:id', 'WorkspaceController.edit').middleware('auth')
  Route.delete('workspace/:id', 'WorkspaceController.delete').middleware('auth')
  Route.post('workspace', 'WorkspaceController.create').middleware('auth')
  Route.get('workspace', 'WorkspaceController.list').middleware('auth')

  // Static responses
  Route.get('features', 'StaticController.features')
  Route.get('services', 'StaticController.emptyArray')
  Route.get('news', 'StaticController.emptyArray')
  Route.get('payment/plans', 'StaticController.plans')
  Route.get('announcements/:version', 'StaticController.announcement')
}).prefix('v1')

// Dashboard
Route.post('new', 'RecipeController.create')
Route.get('new', ({ response }) => response.redirect('/new.html'))

Route.get('/', () => {
  return {
    info: 'Franz Unofficial Server',
    version: '1.0.0',
    author: 'vantezzen',
    repo: 'https://github.com/vantezzen/franz-server'
  }
})
