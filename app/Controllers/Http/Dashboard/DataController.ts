import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class DataController {
  /**
   * Display the data page
   */
  public async show({ view }: HttpContextContract) {
    return view.render('dashboard.data');
  }
}
