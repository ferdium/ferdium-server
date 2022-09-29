import ShieldMiddleware from '@ioc:Adonis/Addons/Shield'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Shield extends ShieldMiddleware {
  public async handle (ctx: HttpContextContract, next: () => Promise<void>) {
    return super.handle(ctx, next)
  }
}
