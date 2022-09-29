import type { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { CloudinaryDriver } from './provider'

export * from './provider'
export * from './config'
export default class CloudinaryDriverProvider {
  constructor (protected app: ApplicationContract) {}

  public register () {
    const Drive = this.app.container.resolveBinding('Adonis/Core/Drive')
    const Cloudinary = this.app.container.resolveBinding('Adonis/Addons/Cloudinary')

    Drive.extend('cloudinary', (_disk, _diskName, config) => {
      return new CloudinaryDriver(Cloudinary, config)
    })
  }
}
