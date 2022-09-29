import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import roles from 'Config/roles'
import UserService from 'App/Services/UserService'
import { UpdateProfileValidator } from 'App/Validators/UserValidators'
import Service from 'App/Models/Service'
import Database from '@ioc:Adonis/Lucid/Database'
import Workspace from 'App/Models/Workspace'
import Env from '@ioc:Adonis/Core/Env'

export default class ProfileController {
  private entityService = UserService
  private entityUpdateValidator = UpdateProfileValidator
  private entityModel = User
  private entityUpdateNotification = () => 'Your profile has been updated'

  public async show ({ view, request, bouncer, auth }: HttpContextContract) {
    const entity = await this.entityModel.findOrFail(request.param('id'))
    await bouncer.authorize('viewProfile', entity)
    return view.render('pages/profile/index', { entity, same: auth.user?.id === entity.id, roles })
  }

  public async edit ({ request, bouncer, view }: HttpContextContract) {
    const entity = await this.entityModel.findOrFail(request.param('id'))
    await bouncer.authorize('editProfile', entity)
    const formValues = this.entityService.initFormValues(entity)
    return view.render('pages/profile/edit', {
      hideFieldRole: true,
      formValues,
      formAction: '/profile/update?_method=PUT',
    })
  }

  public async update ({
    request,
    session,
    response,
    bouncer,
  }: HttpContextContract) {
    const validatedData = await request.validate(this.entityUpdateValidator)
    const user = await this.entityModel.findOrFail(validatedData.id)
    await bouncer.authorize('editProfile', user)
    await this.entityService.update(validatedData)
    session.flash({ notification: this.entityUpdateNotification() })
    response.redirect('/profile/' + validatedData.id)
  }

  public async destroy (ctx: HttpContextContract) {
    const entity = await this.entityModel.findOrFail(ctx.request.param('id'))
    const trx = await Database.transaction()
    try {
      await Service.query({ client: trx })
        .where('userId', entity.id)
        .delete()
      await Workspace.query({ client: trx })
        .where('userId', entity.id)
        .delete()
    } catch (error) {
      await trx.rollback()
      ctx.session.flash({
        error: 'Error occurred while deleting user' + (Env.get('APP_DEBUG', false) ? `: ${error}` : ''),
      })
      return ctx.response.redirect('/')
    }

    await trx.commit()

    ctx.session.flash({
      notification: 'User correctly deleted',
    })

    return ctx.response.redirect('/')
  }

  public async data ({ request, bouncer, view }: HttpContextContract) {
    const entity = await this.entityModel.findOrFail(request.param('id'))
    await bouncer.authorize('dataProfile', entity)

    await entity.load('services')
    await entity.load('workspaces')

    for (const service of entity.services) {
      await service.load('recipe')
    }

    return view.render('pages/profile/data', { entity, roles })
  }
}
