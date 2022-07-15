/**
 * Config source: https://git.io/Jvwvt
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import Env from '@ioc:Adonis/Core/Env';
import { ShieldConfig } from '@ioc:Adonis/Addons/Shield';

/*
|--------------------------------------------------------------------------
| Content Security Policy
|--------------------------------------------------------------------------
|
| Content security policy filters out the origins not allowed to execute
| and load resources like scripts, styles and fonts. There are wide
| variety of options to choose from.
*/
export const csp: ShieldConfig['csp'] = {
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
};

/*
|--------------------------------------------------------------------------
| CSRF Protection
|--------------------------------------------------------------------------
|
| CSRF Protection adds another layer of security by making sure, actionable
| routes does have a valid token to execute an action.
|
*/
export const csrf: ShieldConfig['csrf'] = {
  /*
  |--------------------------------------------------------------------------
  | Enable/Disable CSRF
  |--------------------------------------------------------------------------
  */
  enabled: Env.get('NODE_ENV') !== 'test',

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
  exceptRoutes: [],

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
};

/*
|--------------------------------------------------------------------------
| DNS Prefetching
|--------------------------------------------------------------------------
|
| DNS prefetching allows browsers to proactively perform domain name
| resolution in background.
|
| Learn more at https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control
|
*/
export const dnsPrefetch: ShieldConfig['dnsPrefetch'] = {
  /*
  |--------------------------------------------------------------------------
  | Enable/disable this feature
  |--------------------------------------------------------------------------
  */
  enabled: true,

  /*
  |--------------------------------------------------------------------------
  | Allow or Dis-Allow Explicitly
  |--------------------------------------------------------------------------
  |
  | The `enabled` boolean does not set `X-DNS-Prefetch-Control` header. However
  | the `allow` boolean controls the value of `X-DNS-Prefetch-Control` header.
  |
  | - When `allow = true`, then `X-DNS-Prefetch-Control = 'on'`
  | - When `allow = false`, then `X-DNS-Prefetch-Control = 'off'`
  |
  */
  allow: true,
};

/*
|--------------------------------------------------------------------------
| Iframe Options
|--------------------------------------------------------------------------
|
| xFrame defines whether or not your website can be embedded inside an
| iframe. Choose from one of the following options.
|
| - DENY
| - SAMEORIGIN
| - ALLOW-FROM http://example.com
|
| Learn more at https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
*/
export const xFrame: ShieldConfig['xFrame'] = {
  enabled: true,
  action: 'DENY',
};

/*
|--------------------------------------------------------------------------
| Http Strict Transport Security
|--------------------------------------------------------------------------
|
| A security to ensure that a browser always makes a connection over
| HTTPS.
|
| Learn more at https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
|
*/
export const hsts: ShieldConfig['hsts'] = {
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
};

/*
|--------------------------------------------------------------------------
| No Sniff
|--------------------------------------------------------------------------
|
| Browsers have a habit of sniffing content-type of a response. Which means
| files with .txt extension containing Javascript code will be executed as
| Javascript. You can disable this behavior by setting nosniff to false.
|
| Learn more at https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
|
*/
export const contentTypeSniffing: ShieldConfig['contentTypeSniffing'] = {
  enabled: true,
};
