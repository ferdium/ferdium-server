import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UserService from 'App/Services/UserService'
const roleIds = UserService.allRolesExceptRoot().map((r) => r.id)

const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 255

function emailRules () {
  return [rules.maxLength(255), rules.minLength(5)]
}

export function passwordRules (confirm = true) {
  const passwordRules = [
    rules.minLength(PASSWORD_MIN_LENGTH),
    rules.maxLength(PASSWORD_MAX_LENGTH),
    rules.oneLowerCaseAtLeast(),
    rules.oneNumericAtLeast(),
    rules.oneUpperCaseAtLeast(),
    rules.oneSpecialCharacterAtLeast(),
  ]
  if (confirm) {
    passwordRules.push(rules.confirmed('password_confirmation'))
  }
  return passwordRules
}

// no rules for now, we just want passwordConfirmation field
// to be equal to password field, which is validated.
function passwordConfirmationRules () {
  return []
}

function pictureRules () {
  return {
    size: '5mb',
    extnames: ['jpg', 'gif', 'png', 'webp', 'jpeg'],
  }
}

function nameRules () {
  return [rules.maxLength(255), rules.minLength(3)]
}

function customMessages () {
  return {
    'username.required': 'Username field is required',
    'firstname.required': 'First name field is required',
    'lastname.required': 'Last name field is required',
    'email.required': 'Email field is required',
    'email.unique': 'An account with this email already exists',
    'password.required': 'Password field is required',
    'password.minLength':
      'Password must be at least ' + PASSWORD_MIN_LENGTH + ' characters long',
    'password.oneLowerCaseAtLeast':
      'Password must contain at least one lowercase letter',
    'password.oneUpperCaseAtLeast':
      'Password must contain at least one uppercase letter',
    'password.oneNumericAtLeast': 'Password must contain at least one digit',
    'password.oneSpecialCharacterAtLeast':
      'Password must contain at least one special character',
    'password_confirmation.required': 'Password confirmation is required',
    'password_confirmation.confirmed':
      'Password and confirm password does not match.',
    'password_confirmation.minLength':
      'Password must be at least ' + PASSWORD_MIN_LENGTH + ' characters long',
    'role.array': `Role must be one of the following value : ${roleIds.join(
      ',',
    )}`,
  }
}

export class CreateUserValidator {
  constructor (protected ctx: HttpContextContract) { }

  public schema = schema.create({
    username: schema.string({ trim: true }, [
      ...nameRules(),
      rules.unique({ table: 'users', column: 'username' }),
    ]),
    firstname: schema.string({ trim: true }, nameRules()),
    lastname: schema.string({ trim: true }, nameRules()),
    email: schema.string({ trim: true }, [
      ...emailRules(),
      rules.unique({ table: 'users', column: 'email' }),
    ]),
    password: schema.string({ trim: true }, passwordRules()),
    password_confirmation: schema.string(
      { trim: true },
      passwordConfirmationRules(),
    ),
    picture: schema.file.optional(pictureRules()),
  })

  public messages = customMessages()
}

export class UpdateUserValidator {
  constructor (protected ctx: HttpContextContract) { }

  public schema = schema.create({
    id: schema.string(),
    email: schema.string({ trim: true }),
    username: schema.string({ trim: true }, nameRules()),
    firstname: schema.string({ trim: true }, nameRules()),
    lastname: schema.string({ trim: true }, nameRules()),
    password: schema.string.optional({ trim: true }, passwordRules()),
    password_confirmation: schema.string.optional(
      { trim: true },
      passwordConfirmationRules(),
    ),
    role: schema.enum.optional(roleIds),
    picture: schema.file.optional(pictureRules()),
    blocked: schema.boolean.optional(),
  })

  public messages = customMessages()
}

export class CreateAdminUserValidator {
  constructor (protected ctx: HttpContextContract) { }

  public schema = schema.create({
    email: schema.string({ trim: true }, emailRules()),
    username: schema.string({ trim: true }, nameRules()),
    firstname: schema.string({ trim: true }, nameRules()),
    lastname: schema.string({ trim: true }, nameRules()),
    password: schema.string({ trim: true }, passwordRules()),
    password_confirmation: schema.string(
      { trim: true },
      passwordConfirmationRules(),
    ),
    role: schema.enum(roleIds),
    picture: schema.file.optional(pictureRules()),
    blocked: schema.boolean.optional(),
  })

  public messages = customMessages()
}

export class UpdateProfileValidator {
  constructor (protected ctx: HttpContextContract) { }

  public schema = schema.create({
    id: schema.string(),
    email: schema.string({ trim: true }, emailRules()),
    username: schema.string({ trim: true }, nameRules()),
    firstname: schema.string({ trim: true }, nameRules()),
    lastname: schema.string({ trim: true }, nameRules()),
    password: schema.string.optional({ trim: true }, passwordRules()),
    password_confirmation: schema.string.optional(
      { trim: true },
      passwordConfirmationRules(),
    ),
    picture: schema.file.optional(pictureRules()),
    // do NOT put role here, we don't want a user to be able
    // to change its own role with a POST request.
  })

  public messages = customMessages()
}

export class ForgotPasswordValidator {
  constructor (protected ctx: HttpContextContract) { }

  public schema = schema.create({
    password: schema.string({ trim: true }, passwordRules()),
    password_confirmation: schema.string(
      { trim: true },
      passwordConfirmationRules(),
    ),
  })

  public messages = customMessages()
}
