import type { ApplicationContract } from '@ioc:Adonis/Core/Application'
import ConnectionAttemptService from 'App/Services/ConnectionAttemptService'
import { CloudinaryDriver } from './drive-cloudinary'

/*
|--------------------------------------------------------------------------
| Provider
|--------------------------------------------------------------------------
|
| Your application is not ready when this file is loaded by the framework.
| Hence, the top level imports relying on the IoC container will not work.
| You must import them inside the life-cycle methods defined inside
| the provider class.
|
*/
export default class AppProvider {
  constructor (protected app: ApplicationContract) {}

  public register () {
    this.app.container.singleton('App/ConnectionAttemptService', () => new ConnectionAttemptService())
    this.app.container.bind('Adonis/Lucid/Json', () => {
      const { jsonColumn } = require('../decorators/JsonColumnDecorator')
      return {
        jsonColumn,
      }
    })
  }

  public async boot () {
  }

  public async ready () {
    // App is ready
    const Database = this.app.container.resolveBinding('Adonis/Lucid/Database')
    const Event = this.app.container.resolveBinding('Adonis/Core/Event')
    Event.on('db:query', Database.prettyPrint)

    const Drive = this.app.container.resolveBinding('Adonis/Core/Drive')
    const cloudinary = this.app.container.resolveBinding('Adonis/Addons/Cloudinary')

    Drive.extend('cloudinary', (_disk, _diskName, _config) => new CloudinaryDriver(cloudinary, _config))
  }

  public async shutdown () {
    // Cleanup, since app is going down
  }
}
