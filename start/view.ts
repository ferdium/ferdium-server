import View from '@ioc:Adonis/Core/View'
import Route from '@ioc:Adonis/Core/Route'
import Application from '@ioc:Adonis/Core/Application'
import { InvalidArgumentException } from '@adonisjs/generic-exceptions'

/**
 * Return url for the route
 */
View.global('route', (...args: any[]) => {
  let url

  try {
    url = Route.makeUrl(args[0], args.slice(1))
  } catch (error) {
    throw new InvalidArgumentException(`"route" view global error: ${error.message}`)
  }

  const baseUrl = Application?.config ? Application.config.get('app.http.baseUrl', '') : ''
  return url && /^http(s)?/.test(url) ? url : `${baseUrl}${url}`
})

/**
 * Make url for the assets file
 */
View.global('assetsUrl', function (url) {
  const baseUrl = Application?.config ? Application.config.get('app.http.baseUrl', '') : ''
  return url && /^\/|^http(s)?/.test(url) ? url : `${baseUrl}/${url}`
})

/**
 * Make link tag for css
 */
View.global('style', function (url, skipPrefix = false) {
  url = !url.endsWith('.css') && !skipPrefix ? `${url}.css` : url
  return this.safe(`<link rel="stylesheet" href="${this.asset(url)}" />`)
})

/**
 * Make script tag for javascript
 */
View.global('script', function (url: string, skipPrefix: boolean = false) {
  url = !url.endsWith('.js') && !skipPrefix ? `${url}.js` : url
  return this.safe(`<script type="text/javascript" src="${this.asset(url)}"></script>`)
})

/**
 * Make script tag for javascript
 */
View.global('old', function (name: string, _default: any) {
  return this.flashMessages.has(name) ? this.flashMessages.get(name) : _default
})

/**
 * Make script tag for javascript
 */
View.global('stringify', JSON.stringify)
