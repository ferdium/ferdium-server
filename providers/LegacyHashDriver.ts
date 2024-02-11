import bcrypt from 'bcrypt'
import { HashDriverContract } from '@adonisjs/core/hash'

/**
 * Implementation of custom bcrypt driver
 */
export class LegacyHashDriver implements HashDriverContract {
  /**
   * Hash value
   */
  public async make(value: string) {
    return bcrypt.hash(value, 10)
  }
  /**
   * Verify value
   */
  public async verify(hashedValue: string, plainValue: string) {
    return bcrypt.compare(plainValue, hashedValue)
  }
}
