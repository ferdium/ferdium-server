import env from '#start/env'
import { defineConfig } from '@adonisjs/shield'

export default defineConfig({
  csp: {
    /*
    |--------------------------------------------------------------------------
    | Enable/disable CSP
    |--------------------------------------------------------------------------
    |
    | The CSP rules are disabled by default for seamless onboarding.
    |
    */
    enabled: false,

    /*
    |--------------------------------------------------------------------------
    | Directives
    |--------------------------------------------------------------------------
    |
    | All directives are defined in camelCase and here is the list of
    | available directives and their possible values.
    |
    | https://content-security-policy.com
    |
    | @example
    | directives: {
    |   defaultSrc: ["'self'", '@nonce', 'cdnjs.cloudflare.com']
    | }
    |
    */
    directives: {},

    /*
    |--------------------------------------------------------------------------
    | Report only
    |--------------------------------------------------------------------------
    |
    | Setting `reportOnly=true` will not block the scripts from running and
    | instead report them to a URL.
    |
    */
    reportOnly: false,
  },
  csrf: {
    /*
    |--------------------------------------------------------------------------
    | Enable/Disable CSRF
    |--------------------------------------------------------------------------
    */
    enabled: env.get('NODE_ENV') === 'production',

    /*
    |--------------------------------------------------------------------------
    | Routes to Ignore
    |--------------------------------------------------------------------------
    |
    | Define an array of route patterns that you want to ignore from CSRF
    | validation. Make sure the route patterns are started with a leading
    | slash. Example:
    |
    | `/foo/bar`
      |
      | Also you can define a function that is evaluated on every HTTP Request.
      | ```
      |  exceptRoutes: ({ request }) => request.url().includes('/api')
      | ```
    |
    */
    exceptRoutes: (ctx) => {
      // ignore all routes starting with /v1/ (api)
      return ctx.request.url().includes('/v1/') || ctx.request.url().includes('/import')
    },

    /*
    |--------------------------------------------------------------------------
    | Enable Sharing Token Via Cookie
    |--------------------------------------------------------------------------
    |
    | When the following flag is enabled, AdonisJS will drop `XSRF-TOKEN`
    | cookie that frontend frameworks can read and return back as a
    | `X-XSRF-TOKEN` header.
    |
    | The cookie has `httpOnly` flag set to false, so it is little insecure and
    | can be turned off when you are not using a frontend framework making
    | AJAX requests.
    |
    */
    enableXsrfCookie: true,

    /*
    |--------------------------------------------------------------------------
    | Methods to Validate
    |--------------------------------------------------------------------------
    |
    | Define an array of HTTP methods to be validated for a valid CSRF token.
    |
    */
    methods: ['POST', 'PUT', 'PATCH', 'DELETE'],
  },
  hsts: {
    enabled: true,
    /*
    |--------------------------------------------------------------------------
    | Max Age
    |--------------------------------------------------------------------------
    |
    | Control, how long the browser should remember that a site is only to be
    | accessed using HTTPS.
    |
    */
    maxAge: '180 days',

    /*
    |--------------------------------------------------------------------------
    | Include Subdomains
    |--------------------------------------------------------------------------
    |
    | Apply rules on the subdomains as well.
    |
    */
    includeSubDomains: true,

    /*
    |--------------------------------------------------------------------------
    | Preloading
    |--------------------------------------------------------------------------
    |
    | Google maintains a service to register your domain and it will preload
    | the HSTS policy. Learn more https://hstspreload.org/
    |
    */
    preload: false,
  },
  contentTypeSniffing: {
    enabled: true,
  },
})
