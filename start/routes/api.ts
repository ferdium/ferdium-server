// As this is currently a rebuild of the initial API we it is grouped in /v2/

import router from '@adonisjs/core/services/router'
const UserController = () => import('#controllers/Http/UserController')
const ServiceController = () => import('#controllers/Http/ServiceController')
const RecipeController = () => import('#controllers/Http/RecipeController')

router
  .group(() => {
    // User authentification
    router.post('auth/signup', [UserController, 'signup']).middleware('guest')
    router.post('auth/login', [UserController, 'login']).middleware('guest')

    // User info
    router.get('me', [UserController, 'me']).middleware('auth:jwt')
    router.put('me', [UserController, 'updateMe']).middleware('auth:jwt')
    router.get('me/newtoken', [UserController, 'newToken']).middleware('auth:jwt')

    // // Service info
    router.post('service', [ServiceController, 'create']).middleware('auth:jwt')
    router.put('service/reorder', [ServiceController, 'reorder']).middleware('auth:jwt')
    router.put('service/:id', [ServiceController, 'edit']).middleware('auth:jwt')
    router.delete('service/:id', [ServiceController, 'delete']).middleware('auth:jwt')
    router.get('me/services', [ServiceController, 'list']).middleware('auth:jwt')
    router.get('recipe', [ServiceController, 'list']).middleware('auth:jwt')
    router.get('icon/:id', [ServiceController, 'icon'])

    // Recipe store
    router.get('recipes', [RecipeController, 'list'])
    router.get('recipes/search', [RecipeController, 'search'])
    router.get('recipes/popular', [RecipeController, 'popularRecipes'])
    router.get('recipes/download/:recipe', [RecipeController, 'download'])
    router.post('recipes/update', [RecipeController, 'update'])

    // // Workspaces
    router.put('workspace/:id', 'WorkspaceController.edit').middleware('auth:jwt')
    router.delete('workspace/:id', 'WorkspaceController.delete').middleware('auth:jwt')
    router.post('workspace', 'WorkspaceController.create').middleware('auth:jwt')
    router.get('workspace', 'WorkspaceController.list').middleware('auth:jwt')

    // Static responses
    router.get('features/:mode?', 'Api/Static/FeaturesController.show')
    router.get('services', 'Api/Static/EmptyController.show')
    router.get('news', 'Api/Static/EmptyController.show')
    router.get('announcements/:version', 'Api/Static/AnnouncementsController.show')
  })
  .prefix('/v1')
