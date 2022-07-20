import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class PlansController {
  public async show({ response }: HttpContextContract) {
    return response.send({
      month: {
        id: 'franz-supporter-license',
        price: 99,
      },
      year: {
        id: 'franz-supporter-license-year-2019',
        price: 99,
      },
    });
  }
}
