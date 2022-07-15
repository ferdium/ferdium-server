import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class AccountController {
  /**
   * Shows the user account page
   */
  public async show({ view }: HttpContextContract) {
    // inplement your logic here
  }

  /**
   * Stores user account data
   */
  public async store() {
    // inplement your logic here
  }
}
