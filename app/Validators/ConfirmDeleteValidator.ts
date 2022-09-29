import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ConfirmDeleteValidator {
  constructor (protected ctx: HttpContextContract) { }

  public schema = schema.create({
    title: schema.string(),
    id: schema.number(),
    formAction: schema.string(),
    returnUrl: schema.string(),
  })

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
   *
   */
  public messages = {
    'name.required': 'Name param is required',
    'id.required': 'Id param is required',
    'formAction.required': 'formAction param is required',
    'returnUrl.required': 'returnUrl param is required',
  }
}
