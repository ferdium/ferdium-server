import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ConfirmDeleteValidator from 'App/Validators/ConfirmDeleteValidator'
import { ConfirmDeleteOptions } from 'App/types'

export default class AdminController {
  public async confirmDelete ({ view, request }: HttpContextContract) {
    let errors
    let options: ConfirmDeleteOptions | undefined
    try {
      options = await request.validate(ConfirmDeleteValidator)
    } catch (e) {
      errors = e.messages
    }
    return view.render('pages/admin/confirmDelete', {
      options,
      errors,
    })
  }
}
