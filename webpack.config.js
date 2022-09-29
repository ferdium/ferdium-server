const { join } = require('path')
const Encore = require('@symfony/webpack-encore')

/*
|--------------------------------------------------------------------------
| Encore runtime environment
|--------------------------------------------------------------------------
*/
if (!Encore.isRuntimeEnvironmentConfigured()) {
  Encore.configureRuntimeEnvironment(process.env.NODE_ENV || 'dev')
}

/*
|--------------------------------------------------------------------------
| Output path
|--------------------------------------------------------------------------
|
| The output path for writing the compiled files. It should always
| be inside the public directory, so that AdonisJS can serve it.
|
*/
Encore.setOutputPath('./public/assets')

/*
|--------------------------------------------------------------------------
| Public URI
|--------------------------------------------------------------------------
|
| The public URI to access the static files. It should always be
| relative from the "public" directory.
|
*/
Encore.setPublicPath('/assets')

/*
|--------------------------------------------------------------------------
| Entrypoints
|--------------------------------------------------------------------------
|
| Entrypoints are script files that boots your frontend application. Ideally
| a single entrypoint is used by majority of applications. However, feel
| free to add more (if required).
|
| Also, make sure to read the docs on "Assets bundler" to learn more about
| entrypoints.
|
*/
Encore.addEntry('app', './resources/js/app.js')
Encore.addEntry('new', './resources/js/new.js')
Encore.addEntry('transfer', './resources/js/transfer.js')

Encore.addStyleEntry('main', './resources/css/main.css')
Encore.addStyleEntry('vanilla', './resources/css/vanilla.css')
Encore.addStyleEntry('tailwind', './resources/css/tailwind.css')
/*
|--------------------------------------------------------------------------
| Copy assets
|--------------------------------------------------------------------------
|
| Since the edge templates are not part of the Webpack compile lifecycle, any
| images referenced by it will not be processed by Webpack automatically. Hence
| we must copy them manually.
|
*/
// Encore.copyFiles({
//   from: './resources/images',
//   to: 'images/[path][name].[hash:8].[ext]',
// })
if (Encore.isProduction()) {
  Encore.copyFiles({
    from: './resources/img',
    to: 'img/[path][name].[hash:8].[ext]',
  })
} else {
  Encore.copyFiles({
    from: './resources/img',
    to: 'img/[path][name].[ext]',
  })
}

/*
|--------------------------------------------------------------------------
| Split shared code
|--------------------------------------------------------------------------
|
| Instead of bundling duplicate code in all the bundles, generate a separate
| bundle for the shared code.
|
| https://symfony.com/doc/current/frontend/encore/split-chunks.html
| https://webpack.js.org/plugins/split-chunks-plugin/
|
*/
// Encore.splitEntryChunks()

/*
|--------------------------------------------------------------------------
| Isolated entrypoints
|--------------------------------------------------------------------------
|
| Treat each entry point and its dependencies as its own isolated module.
|
*/
Encore.disableSingleRuntimeChunk()

/*
|--------------------------------------------------------------------------
| Cleanup output folder
|--------------------------------------------------------------------------
|
| It is always nice to cleanup the build output before creating a build. It
| will ensure that all unused files from the previous build are removed.
|
*/
Encore.cleanupOutputBeforeBuild()

/*
|--------------------------------------------------------------------------
| Source maps
|--------------------------------------------------------------------------
|
| Enable source maps in production
|
*/
Encore.enableSourceMaps(!Encore.isProduction())

/*
|--------------------------------------------------------------------------
| Assets versioning
|--------------------------------------------------------------------------
|
| Enable assets versioning to leverage lifetime browser and CDN cache
|
*/
Encore.enableVersioning(Encore.isProduction())

/*
|--------------------------------------------------------------------------
| Configure dev server
|--------------------------------------------------------------------------
|
| Here we configure the dev server to enable live reloading for edge templates.
| Remember edge templates are not processed by Webpack and hence we need
| to watch them explicitly and livereload the browser.
|
*/
Encore.configureDevServerOptions((options) => {
  /**
   * Normalize "options.static" property to an array
   */
  if (!options.static) {
    options.static = []
  } else if (!Array.isArray(options.static)) {
    options.static = [options.static]
  }

  /**
   * Enable live reload and add views directory
   */
  options.liveReload = true
  options.static.push({
    directory: join(__dirname, './resources/views'),
    watch: true,
  })
})

/*
|--------------------------------------------------------------------------
| CSS precompilers support
|--------------------------------------------------------------------------
|
| Uncomment one of the following lines of code to enable support for your
| favorite CSS precompiler
|
*/
// Encore.enableSassLoader()
// Encore.enableLessLoader()
// Encore.enableStylusLoader()

/*
|--------------------------------------------------------------------------
| CSS loaders
|--------------------------------------------------------------------------
|
| Uncomment one of the following line of code to enable support for
| PostCSS or CSS.
|
*/
// Encore.enablePostCssLoader()
// Encore.configureCssLoader(() => {})

/*
|--------------------------------------------------------------------------
| Enable Vue loader
|--------------------------------------------------------------------------
|
| Uncomment the following lines of code to enable support for vue. Also make
| sure to install the required dependencies.
|
*/
// Encore.enableVueLoader(() => {}, {
//   version: 3,
//   runtimeCompilerBuild: false,
//   useJsx: false
// })

/*
|--------------------------------------------------------------------------
| Configure logging
|--------------------------------------------------------------------------
|
| To keep the terminal clean from unnecessary info statements , we only
| log warnings and errors. If you want all the logs, you can change
| the level to "info".
|
*/
const config = Encore.getWebpackConfig()
config.infrastructureLogging = {
  level: 'warn',
}
config.stats = 'errors-warnings'

/*
|--------------------------------------------------------------------------
| Export config
|--------------------------------------------------------------------------
|
| Export config for webpack to do its job
|
*/
module.exports = config
