import { LegacyHashDriver } from './LegacyHashDriver.js'
import { ApplicationService } from '@adonisjs/core/types'

export default class LegacyHasherProvider {
  constructor(protected app: ApplicationService) {}

  public async boot() {
    const Hash = this.app.container.use('Adonis/Core/Hash')

    Hash.extend('legacy', () => {
      return new LegacyHashDriver()
    })
  }
}
