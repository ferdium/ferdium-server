import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import {
  CreateAdminUserValidator,
  UpdateUserValidator,
} from 'App/Validators/UserValidators'

import { createConfirmDeleteLink } from 'App/Services/HelpersService'
import User from 'App/Models/User'
import UserService from 'App/Services/UserService'
import roles from 'Config/roles'

export default class AdminUsersController {
  // controller config
  private entityTable = 'users'
  private entityModel = User
  private entityService = UserService
  private entityListPath = '/admin/users'
  private entityIndexView = 'pages/admin/users'
  private entityFormView = 'pages/admin/userForm'
  private entityCreateValidator = CreateAdminUserValidator
  private entityUpdateValidator = UpdateUserValidator
  private entityFormAction = (entity) => {
    return '/admin/users/' + entity.id
  }
  private entityCreationNotification = () => 'User has been created'
  private entityUpdateNotification = () => 'User has been updated'
  private entityDeleteNotification = () => 'User has been deleted'

  /**
   * Liste des posts pour l'admin
   */
  public async index ({ view, request, bouncer }: HttpContextContract) {
    await bouncer.authorize('adminListUsers')
    const page = request.input('page', 1)
    const limit = 20
    const entities = await this.entityModel.query().paginate(
      page,
      limit,
    )
    entities.baseUrl(this.entityListPath)

    // add delete links and edit Links for each post.
    entities.forEach((entity) => {
      const deleteLink = createConfirmDeleteLink({
        id: entity.id,
        title: `Are you sure you want to delete "${entity.username}" ?`,
        formAction: `${this.entityListPath}/${entity.id}?_method=DELETE`,
        returnUrl: this.entityListPath,
      })
      entity.$extras._deleteLink = deleteLink
      entity.$extras._editLink = `${this.entityListPath}/${entity.id}/edit`
    })

    return view.render(this.entityIndexView, { entities, roles })
  }

  public async create ({ view, bouncer }: HttpContextContract) {
    await bouncer.authorize('adminCreateUser')
    const formValues = this.entityService.initFormValues()
    return view.render(this.entityFormView, {
      roles: this.entityService.allRolesExceptRoot(),
      formValues,
      formAction: this.entityListPath,
    })
  }

  public async store ({
    session,
    request,
    response,
    bouncer,
  }: HttpContextContract) {
    await bouncer.authorize('adminCreateUser')
    let payload = await request.validate(this.entityCreateValidator)
    await this.entityService.create(payload)
    session.flash({
      notification: this.entityCreationNotification(),
    })
    response.redirect(this.entityListPath)
  }

  public async show ({}: HttpContextContract) {}

  public async edit ({ view, request, bouncer }: HttpContextContract) {
    await bouncer.authorize('adminEditUser')
    const entity = await this.entityModel.findOrFail(request.param('id'))
    const formValues = this.entityService.initFormValues(entity)
    return view.render(this.entityFormView, {
      hideFieldRole: entity.roles.includes('root'),
      roles: this.entityService.allRolesExceptRoot(),
      formValues,
      formAction: this.entityFormAction(entity) + '?_method=PUT',
    })
  }

  public async update ({
    request,
    session,
    response,
    bouncer,
  }: HttpContextContract) {
    await bouncer.authorize('adminEditUser')
    const payload = await request.validate(this.entityUpdateValidator)
    this.entityService.update(payload)
    session.flash({ notification: this.entityUpdateNotification() })
    response.redirect(this.entityListPath)
  }

  public async destroy ({
    request,
    response,
    session,
    bouncer,
  }: HttpContextContract) {
    await bouncer.authorize('adminDeleteUser')
    const user = await this.entityModel.findOrFail(request.param('id'))
    user.delete()
    session.flash({ notification: this.entityDeleteNotification() })
    response.redirect(this.entityListPath)
  }
}
