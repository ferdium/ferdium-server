import type { HttpContext } from '@adonisjs/core/http'

export default class EmptyController {
  public async show({ response }: HttpContext) {
    return response.send([])
  }
}
