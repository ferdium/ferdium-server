import router from '@adonisjs/core/services/router';

// Health check
router.get('health', 'HealthController.index');

// Legal documents
router.get('terms', ({ response }) => response.redirect('/terms.html'));
router.get('privacy', ({ response }) => response.redirect('/privacy.html'));

// Index
router.get('/', ({ view }) => view.render('others/index'));

router
  .group(() => {
    router
      .group(() => {
        // Guest troutes
        router
          .group(() => {
            router.get('login', 'Dashboard/LoginController.show');
            router.post('login', 'Dashboard/LoginController.login').as('login');

            // Reset password
            router.get('forgot', 'Dashboard/ForgotPasswordController.show');
            router.post(
              'forgot',
              'Dashboard/ForgotPasswordController.forgotPassword',
            );

            router.get('reset', 'Dashboard/ResetPasswordController.show');
            router.post(
              'reset',
              'Dashboard/ResetPasswordController.resetPassword',
            );
          })
          .middleware(['dashboard', 'guest']);

        // Authenticated routes
        router
          .group(() => {
            router.get('account', 'Dashboard/AccountController.show');
            router.post('account', 'Dashboard/AccountController.store');

            router.get('data', 'Dashboard/DataController.show');
            router.get('export', 'Dashboard/ExportController.show');

            router.get('transfer', 'Dashboard/TransferController.show');
            router.post('transfer', 'Dashboard/TransferController.import');

            router.get('delete', 'Dashboard/DeleteController.show');
            router.post('delete', 'Dashboard/DeleteController.delete');

            router.get('logout', 'Dashboard/LogOutController.logout');

            router.get('*', ({ response }) =>
              response.redirect('/user/account'),
            );
          })
          .middleware(['dashboard', 'auth:web']);
      })
      .prefix('user');

    // Franz/Ferdi account import
    router.get('import', ({ view }) => view.render('others/import'));
    router.post('import', 'UserController.import');

    // 404 handler
    router.get('/*', ({ response }) => response.redirect('/'));
  })
  .middleware(['dashboard']);
