// As this is currently a rebuild of the initial API we it is grouped in /v2/

import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';
const UserController = () => import('#controllers/Http/UserController');
const ServiceController = () => import('#controllers/Http/ServiceController');
const RecipeController = () => import('#controllers/Http/RecipeController');
const WorkspaceController = () =>
  import('#controllers/Http/WorkspaceController');
const FeaturesController = () =>
  import('#controllers/Http/Api/Static/FeaturesController');
const EmptyController = () =>
  import('#controllers/Http/Api/Static/EmptyController');
const AnnouncementsController = () =>
  import('#controllers/Http/Api/Static/AnnouncementsController');

router
  .group(() => {
    // User authentification
    router
      .post('auth/signup', [UserController, 'signup'])
      .use(middleware.guest());
    router
      .post('auth/login', [UserController, 'login'])
      .use(middleware.guest());

    // User info
    router.get('me', [UserController, 'me']).use(middleware.auth());
    router.put('me', [UserController, 'updateMe']).use(middleware.auth());
    router
      .get('me/newtoken', [UserController, 'newToken'])
      .use(middleware.auth());

    // // Service info
    router
      .post('service', [ServiceController, 'create'])
      .use(middleware.auth());
    router
      .put('service/reorder', [ServiceController, 'reorder'])
      .use(middleware.auth());
    router
      .put('service/:id', [ServiceController, 'edit'])
      .use(middleware.auth());
    router
      .delete('service/:id', [ServiceController, 'delete'])
      .use(middleware.auth());
    router
      .get('me/services', [ServiceController, 'list'])
      .use(middleware.auth());
    router.get('recipe', [ServiceController, 'list']).use(middleware.auth());
    router.get('icon/:id', [ServiceController, 'icon']);

    // Recipe store
    router.get('recipes', [RecipeController, 'list']);
    router.get('recipes/search', [RecipeController, 'search']);
    router.get('recipes/popular', [RecipeController, 'popularRecipes']);
    router.get('recipes/download/:recipe', [RecipeController, 'download']);
    router.post('recipes/update', [RecipeController, 'update']);

    // // Workspaces
    router
      .put('workspace/:id', [WorkspaceController, 'edit'])
      .use(middleware.auth());
    router
      .delete('workspace/:id', [WorkspaceController, 'delete'])
      .use(middleware.auth());
    router
      .post('workspace', [WorkspaceController, 'create'])
      .use(middleware.auth());
    router
      .get('workspace', [WorkspaceController, 'list'])
      .use(middleware.auth());

    // Static responses
    router.get('features/:mode?', [FeaturesController, 'show']);
    router.get('services', [EmptyController, 'show']);
    router.get('news', [EmptyController, 'show']);
    router.get('announcements/:version', [AnnouncementsController, 'show']);
  })
  .prefix('/v1');
