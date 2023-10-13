import { ApplicationContract } from '@ioc:Adonis/Core/Application';
import { LegacyHashDriver } from './LegacyHashDriver';

export default class LegacyHasherProvider {
  constructor(protected app: ApplicationContract) {}

  public async boot() {
    const Hash = this.app.container.use('Adonis/Core/Hash');

    Hash.extend('legacy', () => {
      return new LegacyHashDriver();
    });
  }
}
