import Route from '@ioc:Adonis/Core/Route';
import Env from '@ioc:Adonis/Core/Env';

// User dashboard TODO: Put this check in middleware.
if (Env.get('IS_DASHBOARD_ENABLED') !== 'false') {
  Route.group(() => {
    // Guest troutes
    Route.group(() => {
      Route.get('login', 'Dashboard/LoginController.show');
      Route.post('login', 'Dashboard/LoginController.login').as('login');

      // Reset password
      Route.get('forgot', 'Dashboard/ForgotPasswordController.show');
      Route.post('forgot', 'Dashboard/ForgotPasswordController.forgotPassword');

      Route.get('reset', 'Dashboard/ResetPasswordController.show');

      // change route
      Route.post('reset', 'Dashboard/ResetPasswordController.resetPassword');
    }).middleware('guest');

    // Authenticated routes
    Route.group(() => {
      Route.get('account', 'Dashboard/AccountController.show');
      Route.post('account', 'Dashboard/AccountController.store');

      Route.get('data', 'Dashboard/DataController.show');
      Route.get('export', 'DashboardController.export');

      Route.get('transfer', 'Dashboard/TransferController.show');
      Route.post('transfer', 'Dashboard/TransferController.import');

      Route.get('delete', 'Dashboard/DeleteController.show');
      Route.post('delete', 'Dashboard/DeleteController.delete');

      Route.get('logout', 'Dashboard/LogOutController.logout');

      Route.get('*', ({ response }) => response.redirect('/user/account'));
    }).middleware('auth:web');
  })
    .prefix('user')
    .middleware(['shield']);
} else {
  Route.group(() => {
    Route.get('*', ({ response }) =>
      response.send(
        'The user dashboard is disabled on this server\n\nIf you are the server owner, please set IS_DASHBOARD_ENABLED to true to enable the dashboard.',
      ),
    );
  }).prefix('user');
}

// Health check
Route.get('health', 'HealthController.index');

// Franz/Ferdi account import
Route.get('import', ({ view }) => view.render('others.import'));
Route.post('import', 'UserController.import');

// Legal documents
Route.get('terms', ({ response }) => response.redirect('/terms.html'));
Route.get('privacy', ({ response }) => response.redirect('/privacy.html'));

// Index
Route.get('/', ({ view }) => view.render('others.index'));

// 404 handler
Route.get('/*', ({ response }) => response.redirect('/'));
