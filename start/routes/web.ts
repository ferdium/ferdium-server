import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';
const HealthController = () => import('#controllers/Http/HealthController');
const LoginController = () =>
  import('#controllers/Http/Dashboard/LoginController');
const ForgotPasswordController = () =>
  import('#controllers/Http/Dashboard/ForgotPasswordController');
const ResetPasswordController = () =>
  import('#controllers/Http/Dashboard/ResetPasswordController');
const AccountController = () =>
  import('#controllers/Http/Dashboard/AccountController');
const DataController = () =>
  import('#controllers/Http/Dashboard/DataController');
const ExportController = () =>
  import('#controllers/Http/Dashboard/ExportController');
const TransferController = () =>
  import('#controllers/Http/Dashboard/TransferController');
const DeleteController = () =>
  import('#controllers/Http/Dashboard/DeleteController');
const LogOutController = () =>
  import('#controllers/Http/Dashboard/LogOutController');
const UserController = () => import('#controllers/Http/UserController');

// Health check
router.get('health', [HealthController, 'index']);

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
            router.get('login', [LoginController, 'show']);
            router.post('login', [LoginController, 'login']).as('login');

            // Reset password
            router.get('forgot', [ForgotPasswordController, 'show']);
            router.post('forgot', [ForgotPasswordController, 'forgotPassword']);

            router.get('reset', [ResetPasswordController, 'show']);
            router.post('reset', [ResetPasswordController, 'resetPassword']);
          })
          .use(middleware.dashboard())
          .use(middleware.guest());

        // Authenticated routes
        router
          .group(() => {
            router.get('account', [AccountController, 'show']);
            router.post('account', [AccountController, 'store']);

            router.get('data', [DataController, 'show']);
            router.get('export', [ExportController, 'show']);

            router.get('transfer', [TransferController, 'show']);
            router.post('transfer', [TransferController, 'import']);

            router.get('delete', [DeleteController, 'show']);
            router.post('delete', [DeleteController, 'delete']);

            router.get('logout', [LogOutController, 'logout']);

            router.get('*', ({ response }) =>
              response.redirect('/user/account'),
            );
          })
          .use(middleware.dashboard())
          .use(middleware.auth());
      })
      .prefix('user');

    // Franz/Ferdi account import
    router.get('import', ({ view }) => view.render('others/import'));
    router.post('import', [UserController, 'import']);

    // 404 handler
    router.get('/*', ({ response }) => response.redirect('/'));
  })
  .use(middleware.dashboard());
