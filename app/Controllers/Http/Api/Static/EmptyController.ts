import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class EmptyController {
  public async show({ response }: HttpContextContract) {
    return response.send([]);
  }
}
