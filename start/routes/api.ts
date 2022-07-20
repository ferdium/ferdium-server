// As this is currently a rebuild of the initial API we it is grouped in /v2/

import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
  // User authentification
  // Route.post('auth/signup', 'UserController.signup').middleware('guest');
  // Route.post('auth/login', 'UserController.login').middleware('guest');

  // // User info
  // Route.get('me', 'UserController.me').middleware('auth');
  // Route.put('me', 'UserController.updateMe').middleware('auth');

  // // Service info
  // Route.post('service', 'ServiceController.create').middleware('auth');
  // Route.put('service/reorder', 'ServiceController.reorder').middleware('auth');
  // Route.put('service/:id', 'ServiceController.edit').middleware('auth');
  // Route.delete('service/:id', 'ServiceController.delete').middleware('auth');
  // Route.get('me/services', 'ServiceController.list').middleware('auth');
  // Route.get('recipe', 'ServiceController.list').middleware('auth');
  // Route.get('icon/:id', 'ServiceController.icon');

  // // Recipe store
  // Route.get('recipes', 'RecipeController.list');
  // Route.get('recipes/search', 'RecipeController.search');
  // Route.get('recipes/popular', 'RecipeController.popularRecipes');
  // Route.get('recipes/download/:recipe', 'RecipeController.download');
  // Route.post('recipes/update', 'RecipeController.update');

  // // Workspaces
  // Route.put('workspace/:id', 'WorkspaceController.edit').middleware('auth');
  // Route.delete('workspace/:id', 'WorkspaceController.delete').middleware('auth');
  // Route.post('workspace', 'WorkspaceController.create').middleware('auth');
  // Route.get('workspace', 'WorkspaceController.list').middleware('auth');

  // Static responses
  Route.get('features/:mode?', 'Api/Static/FeaturesController.show');
  Route.get('services', 'Api/Static/EmptyController.show');
  Route.get('news', 'Api/Static/EmptyController.show');
  Route.get(
    'announcements/:version',
    'Api/Static/AnnouncementsController.show',
  );
}).prefix('/v1');
