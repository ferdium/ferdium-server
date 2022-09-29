/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
*/

import HealthCheck from '@ioc:Adonis/Core/HealthCheck'
import Env from '@ioc:Adonis/Core/Env'
import Route, { RouteGroupContract } from '@ioc:Adonis/Core/Route'

const ApiRoutes: () => RouteGroupContract = () => {
  return Route.group(() => {
    // User authentification
    Route.post('auth/signup', 'UserController.signup').middleware('guest')
    Route.post('auth/login', 'UserController.login').middleware('guest')

    // User info
    Route.get('me', 'UserController.me')
    Route.put('me', 'UserController.updateMe')

    // Service info
    Route.post('service', 'ServiceController.create')
    Route.put('service/reorder', 'ServiceController.reorder')
    Route.put('service/:id', 'ServiceController.edit')
    Route.delete('service/:id', 'ServiceController.delete')
    Route.get('me/services', 'ServiceController.list')
    Route.get('recipe', 'ServiceController.list')
    Route.get('icon/:id', 'ServiceController.icon')

    // Recipe store
    Route.get('recipes', 'RecipeController.index')
    Route.get('recipes/search', 'RecipeController.search')
    Route.get('recipes/popular', 'RecipeController.popularRecipes')
    Route.get('recipes/download/:recipe', 'RecipeController.download')
    Route.post('recipes/update', 'RecipeController.update')

    // Workspaces
    Route.put('workspace/:id', 'WorkspaceController.edit')
    Route.delete('workspace/:id', 'WorkspaceController.delete')
    Route.post('workspace', 'WorkspaceController.create')
    Route.get('workspace', 'WorkspaceController.list')

    // Static responses
    Route.get('features/:mode?', 'StaticController.features')
    Route.get('services', 'StaticController.emptyArray')
    Route.get('news', 'StaticController.emptyArray')
    Route.get('payment/plans', 'StaticController.plans')
    Route.get('announcements/:version', 'StaticController.announcement')

    Route.get('/password-strengthOld', 'api/v1/asswordController.strength')
    Route.get(
      // :password MUST be urlEncoded, as it might contains special characters.
      '/password-strength/:password',
      'api/v1/passwordController.strength',
    )
  })
}

// Health: Returning if all systems function correctly
Route.get('health', async ({ response }) => {
  const report = await HealthCheck.getReport()
  return report.healthy ? response.ok(report) : response.badRequest(report)
})

// API is grouped under '/v1/' route
ApiRoutes().prefix('v1').middleware('auth:api')

// API is grouped under '/api/v1/' route
ApiRoutes().prefix('/api/v1').middleware('auth:api')

// Web grouped
Route.get('signup', 'SignupController.signupForm')
Route.post('signup', 'SignupController.submitSignupForm')
Route.get('signup/check-your-inbox', 'SignupController.checkYourInbox')
Route.get('verify-email/:id', 'SignupController.verifyEmail')
Route
  .get('login', 'SigninController.create')
  .middleware('guest')
  .as('login')

Route
  .post('login', 'SigninController.store')
  .middleware('guest')
  .middleware('connectionAttempt')

Route.get('logout', 'SigninController.destroy').middleware('auth')

Route.get('forgot-password', 'ForgotPasswordController.emailForm').middleware(
  'guest',
)

Route.post('forgot-password', 'ForgotPasswordController.submitEmailForm')

Route
  .get('send-email-verification', 'SendEmailVerificationController.emailForm')
  .middleware('guest')
  .as('send-email-verification')

Route
  .post('send-email-verification', 'SendEmailVerificationController.submitEmailForm')
  .as('send-email-verification.process')

Route.get(
  'forgot-password/check-your-inbox',
  'ForgotPasswordController.checkYourInbox',
).middleware('guest')

Route.get(
  'forgot-password/:id',
  'ForgotPasswordController.resetPasswordForm',
).middleware('guest')

Route.post(
  'forgot-password/:id',
  'ForgotPasswordController.submitResetPasswordForm',
)

// Recipe creation
if (Env.get('IS_CREATION_ENABLED') == 'false') {
  Route.group(() => {
    Route.get('*', ({ response }) =>
      response.send(
        'This server doesn\'t allow the creation of new recipes.\n\nIf you are the server owner, please set IS_CREATION_ENABLED to true to enable recipe creation.',
      ),
    )
  }).prefix('user')
} else {
  // recipe admin
  Route.resource('/admin/recipes', 'AdminRecipesController').middleware({
    '*': 'auth',
  })

  // Route.post('new', 'RecipeController.create')
  // Route.get('new', ({ view }) => {
  //  return view.render('others/new')
  // }).as('newRecipe')

  // Route.post('/admin/recipes', 'RecipeController.create')
  //Route.get('/admin/recipes/create', ({ view }) => {
  //  return view.render('others/new')
  //})
}

// User dashboard
if (Env.get('IS_DASHBOARD_ENABLED') !== 'false') {
  // generic route to confirm entity deletion
  Route.get('admin/confirm-delete', 'AdminController.confirmDelete').middleware(
    'auth',
  )

  // users admin
  Route.resource('/admin/users', 'AdminUsersController').middleware({
    '*': 'auth',
  })

  Route.resource('/profile', 'ProfileController')
    .middleware({
      '*': 'auth',
    })
    .only(['show', 'edit', 'update', 'destroy'])

  Route.get('/profile/:id/data', 'ProfileController.data')
    .middleware('auth')

  Route.post('/profile/:id/data/import', 'DashboardController.import').middleware('auth')
  Route.get('/profile/:id/data/import', ({ view }) => view.render('dashboard/transfer')).middleware('auth')

  Route.resource('/recipes', 'RecipeController')
    .middleware({'*': 'auth'})
    .only(['index', 'show'])

  Route.group(() => {
    // Dashboard
    // Route.get('account', 'DashboardController.account').middleware('auth:web')
    // Route.post('account', 'DashboardController.edit').middleware('auth:web')

    // Route.get('data', 'DashboardController.data').middleware('auth:web')

    Route.get('export', 'DashboardController.export').middleware('auth:web')

    // Route.get('delete', ({ view }) => view.render('dashboard/delete')).middleware('auth:web')
    // Route.post('delete', 'DashboardController.delete').middleware('auth:web')

    // Route.get('logout', 'DashboardController.logout').middleware('auth:web').as('logout')

    Route.get('*', ({ response }) => response.redirect('/'))
  })
    .prefix('user')
} else {
  Route.group(() => {
    Route.get('*', ({ response }) =>
      response.send(
        'The user dashboard is disabled on this server\n\nIf you are the server owner, please set IS_DASHBOARD_ENABLED to true to enable the dashboard.',
      ),
    )
  }).prefix('user')
}

// Franz/Ferdi account import
Route.post('import', 'UserController.import')
Route.get('import', ({ view }) => view.render('others/import'))

// Legal documents
Route.get('terms', ({ response }) => response.redirect('/terms.html'))
Route.get('privacy', ({ response }) => response.redirect('/privacy.html'))

// Index
Route.get('/', ({ view }) => view.render('pages/home'))

// 404 handler
Route.get('/*', ({ response }) => response.redirect('/'))
