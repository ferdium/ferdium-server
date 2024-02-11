import server from '@adonisjs/core/services/server';
import router from '@adonisjs/core/services/router';

server.use([
  () => import('@adonisjs/core/bodyparser_middleware'),
  () => import('@adonisjs/shield/shield_middleware'),
]);

router.named({
  auth: () => import('#app/Middleware/Auth'),
  dashboard: () => import('#app/Middleware/Dashboard'),
  guest: () => import('#app/Middleware/AllowGuestOnly'),
  shield: () => import('@adonisjs/shield/shield_middleware'),
});
