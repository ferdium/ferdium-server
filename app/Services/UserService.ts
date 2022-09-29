import User from 'App/Models/User'
import { RoleId } from 'App/types'
import roles from 'Config/roles'
import { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser'
import config from 'Config/starter'
import VerificationProcedureService from 'App/Services/VerificationProcedureService'
import { VerificationProcedureType } from 'App/types'
import Mail from '@ioc:Adonis/Addons/Mail'
import Env from '@ioc:Adonis/Core/Env'
import { v4 as uuidv4 } from 'uuid'
import starterConfig from 'Config/starter'
import { join, parse } from 'path'
import Drive from '@ioc:Adonis/Core/Drive'

interface CreateUserPayload {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: RoleId;
  blocked?: boolean;
  picture?: MultipartFileContract;
}

interface UpdateUserPayload {
  id: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  role?: RoleId;
  blocked?: boolean;
  picture?: MultipartFileContract;
}

interface FormValues {
  id?: number | string;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  password: string;
  password_confirmation: string;
  picture: string;
  blocked: boolean;
}

interface CreateOptions {
  sendEmail?: boolean;
}

async function create (payload: CreateUserPayload, options?: CreateOptions) {
  // default values for options
  if (!options) {
    options = {}
  }
  if (!options.sendEmail) {
    options.sendEmail = true
  }

  const user = new User()
  user.email = payload.email
  user.username = payload.username
  user.firstname = payload.firstname
  user.lastname = payload.lastname
  user.emailVerified = false
  user.blocked = config.signup.blockUserUntilEmailVerification ? true : false

  // set users roles
  // special case: first create user is automatically the root user.
  if ((await User.first()) === null) {
    user.roles = ['root']
  } else if (payload.role) {
    user.roles = [payload.role]
  } else {
    // defaut role is member, if no role has been provided.
    user.roles = ['member']
  }

  user.password = payload.password.trim()

  if (payload.picture) {
    await payload.picture.moveToDisk('./')
    user.picture = payload.picture.fileName
  }
  const userSaved = await user.save()

  await sendEmailVerification(userSaved, options)

  return userSaved
}

async function sendEmailVerification (user: User, options?: CreateOptions) {
  if (!options) {
    options = {}
  }
  if (!options.sendEmail) {
    options.sendEmail = true
  }

  if (options?.sendEmail && starterConfig.signup.verifyEmail) {
    const verifyEmailId = uuidv4()
    VerificationProcedureService.create({
      id: verifyEmailId,
      userId: user.id.toString(),
      type: VerificationProcedureType.SIGNUP_VERIFY_EMAIL,
    })
    const verifyUrl = Env.get('SITE_URL') + '/verify-email/' + verifyEmailId
    await Mail.send((message) => {
      message
        .from(Env.get('EMAIL_FROM'))
        .to(user.email)
        .subject(`[${Env.get('SITE_NAME')}]- Welcome Onboard ${user.name}`)
        .htmlView('emails/welcome', {
          user: user,
          verifyUrl,
          siteName: Env.get('SITE_NAME'),
        })
    })
  }
}

async function update (payload: UpdateUserPayload): Promise<User> {
  const user = await User.findOrFail(payload.id)
  if (payload.email) {
    user.email = payload.email.trim()
  }
  if (payload.username) {
    user.username = payload.username.trim()
  }
  if (payload.firstname) {
    user.firstname = payload.firstname.trim()
  }
  if (payload.lastname) {
    user.lastname = payload.lastname.trim()
  }
  if (payload.role) {
    user.roles = [payload.role]
  }
  if (payload.password && payload.password_confirmation) {
    user.password = payload.password.trim()
  }
  if (payload.picture) {
    if (user.picture) {
      Drive.use('cloudinary').delete(user.picture)
      user.picture = undefined
    }
    user.picture = join('profile_picture', `${user.id}.${payload.picture.extname || 'png'}`)
    const { name, dir } = parse(user.picture)
    await payload.picture.moveToDisk(dir, { name, visibility: 'public', resource_type: 'image' }, 'cloudinary')
  }
  user.blocked = payload.blocked ? true : false
  const savedUser = await user.save()
  return savedUser
}

// return values to populate the userForm
function initFormValues (entity?: User): FormValues {
  const payload = {
    id: entity?.id ? entity.id : '',
    username: entity?.username ? entity.username : '',
    firstname: entity?.firstname ? entity.firstname : '',
    lastname: entity?.lastname ? entity.lastname : '',
    email: entity?.email ? entity.email : '',
    picture: entity?.picture ? entity.picture : '',
    password: '',
    password_confirmation: '',
    role: entity ? entity.roles[0] : 'member',
    blocked: entity?.blocked ? entity.blocked : false,
  }
  return payload
}

function allRolesExceptRoot () {
  return roles.filter((r) => r.id !== 'root')
}

export default { initFormValues, create, update, allRolesExceptRoot, sendEmailVerification }
