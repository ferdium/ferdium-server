import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { validator, schema } from '@ioc:Adonis/Core/Validator'
import { passwordRules } from 'App/Validators/UserValidators'

export default class PasswordController {
  public async strength ({ params }: HttpContextContract): Promise<{
    success: boolean;
    errors: object | null;
  }> {
    const password = decodeURIComponent(params.password)
    const errorsSchema = {}
    const data = {}
    // create errors from existing passwordRules
    passwordRules(false).forEach((rule) => {
      errorsSchema[rule.name] = schema.string({ trim: true }, [rule])
      data[rule.name] = password
    })
    try {
      await validator.validate({
        schema: schema.create(errorsSchema),
        data,
      })
    } catch (error) {
      return { success: false, errors: error.messages }
    }
    return { success: true, errors: null }
  }
}
