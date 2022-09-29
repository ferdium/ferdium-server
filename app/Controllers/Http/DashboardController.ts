import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Event from '@ioc:Adonis/Core/Event'
import Service from 'App/Models/Service'
import Workspace from 'App/Models/Workspace'
import crypto from 'crypto'
import { v4 as uuid } from 'uuid'
import User from 'App/Models/User'
import Token from 'App/Models/Token'
import Env from '@ioc:Adonis/Core/Env'
import Route from '@ioc:Adonis/Core/Route'
import { readJsonSync } from 'fs-extra'
import Database from '@ioc:Adonis/Lucid/Database'
import { DateTime } from 'luxon'

export default class DashboardController {
  public async signup ({ request, response, session }: HttpContextContract) {
    if (Env.get('IS_REGISTRATION_ENABLED') == 'false') {
      return response.unauthorized({
        message: 'Registration is disabled on this server',
        status: 401,
      })
    }

    const validations = schema.create({
      firstname: schema.string.optional(),
      lastname: schema.string.optional(),
      email: schema.string({}, [
        rules.required(),
        rules.email(),
        rules.unique({
          table: 'users',
          column: 'email',
        }),
      ]),
      username: schema.string({}, [
        rules.required(),
        rules.unique({
          table: 'users',
          column: 'username',
        }),
      ]),
      password: schema.string({}, [rules.required(), rules.confirmed()]),
    })

    let data
    try {
      data = await request.validate({
        schema: validations,
        messages: {
          'username.unique': 'username already taken',
          'email.unique': 'email already taken',
        },
      })
    } catch (excetpion) {
      session.reflash()
      session.flashAll()
      session.flashExcept(['password', 'password_confirmation'])
      session.flash('validation', excetpion.messages)
      return response.redirect('back')
    }

    data = request.only(['username', 'email', 'firstname', 'lastname', 'password'])

    let user
    // Create user in DB
    try {
      user = await User.firstOrCreate({
        username: data.username,
      }, {
        ...data,
        isVerified: false,
      })
    } catch (e) {
      session.reflash()
      session.flashAll()
      session.flashExcept(['password', 'password_confirmation'])
      session.flash('validation', e.messages)
      console.error(e)
      return response.redirect('back')
    }

    // Generate new auth token
    // const token = await auth.use('api').generate(user);

    const url = Route.makeSignedUrl('verifyEmail', {
      email: user.email,
    }, { expiresIn: '30m' })

    Event.emit('signup::verifyEmail', { user, url: url })

    return response.redirect('/user/account')
  }

  public async login ({ request, response, auth, session }: HttpContextContract) {
    const validations = schema.create({
      email: schema.string.optional({}, [
        rules.email(),
        rules.requiredIfNotExists('username'),
        rules.exists({ table: 'users', column: 'email' }),
      ]),
      username: schema.string.optional({}, [
        rules.requiredIfNotExists('email'),
        rules.exists({ table: 'users', column: 'username' }),
      ]),
      password: schema.string({}, [rules.required()]),
      rememberMe: schema.boolean.optional(),
    })

    let data
    try {
      data = await request.validate({ schema: validations })
    } catch (e) {
      session.flash('validation', e.messages)
      session.flashExcept(['password'])
      return response.redirect('back')
    }

    const { username, email, password, rememberMe } = data

    try {
      await auth.use('web').attempt(email || username, password, rememberMe || false)
    } catch (error) {
      session.flash('error', 'Invalid mail or password')
      session.flashExcept(['password'])
      return response.redirect('back')
    }

    return response.redirect('/user/account')
  }

  public async forgotPassword ({ request, response, session, view }: HttpContextContract) {
    const validations = schema.create({
      email: schema.string.optional({}, [rules.requiredIfNotExists('username'), rules.email(), rules.exists({ table: 'users', column: 'email' })]),
      username: schema.string.optional({}, [rules.requiredIfNotExists('email'), rules.exists({ table: 'users', column: 'username' })]),
    })

    let data

    try {
      data = await request.validate({ schema: validations })
    } catch (e) {
      session.reflash()
      session.flashAll()
      session.flashExcept(['password'])
      session.flash('validation', e.messages)
      return response.redirect('back')
    }

    const { username, email } = data

    let user: User
    try {
      // await AuthManager.getAuthForRequest(request).
      user = email ? await User.findByOrFail('email', email) : await User.findByOrFail('username', username)
    } catch (e) {
      console.log(e)
      session.reflash()
      session.flashAll()
      session.flashExcept(['password'])
      session.flash('error', 'User not found')
      return response.redirect('back')
    }

    await user.load('activePasswordTokens')

    let token = await Token
      .query()
      .where('user_id', user.id)
      .where('name', 'password')
      .where('type', 'password')
      .where('is_revoked', false)
      .where('updated_at', '>=', DateTime.now().minus({ hours: 24 }).toFormat('YYYY-MM-DD HH:mm:ss'))
      .first()

    if (token == null) {
      token = await Token.create({
        token: Math.random().toString(16),
        name: 'password',
        userId: user.id,
        type: 'password',
      })
    }

    user = await user.refresh()

    Event.emit('forgot::password', { user, token: token.token })
    // await Persona.forgotPassword(data.mail || data.email);
    // eslint-disable-next-line no-empty

    return view.render('others/message', {
      heading: 'Reset password',
      text: 'If your provided E-Mail address is linked to an account, we have just sent an E-Mail to that address.',
    })
  }

  public async resetPassword ({ request, view }: HttpContextContract) {
    const validations = schema.create({
      password: schema.string({}, [rules.required(), rules.confirmed()]),
      token: schema.string({}, [rules.required()]),
    })

    const data = await request.validate({ schema: validations })

    /*     const validation = await validateAll(request.all(), {
      password: 'required',
      password_confirmation: 'required',
      token: 'required',
    });
    if (validation.fails()) {
      session.flash({
        type: 'danger',
        message: 'Passwords do not match',
      });
      return response.redirect('back');
    } */

    const payload = {
      password: crypto.createHash('sha256').update(data.password).digest('base64'),
      password_confirmation: crypto.createHash('sha256').update(data.password).digest('base64'),
    }

    try {
      const token = await Token.query()
        .where('token', data.token)
        .where('is_revoked', false)
        .where('expires_at', '>=', DateTime.now().toFormat('YYYY-MM-DD HH:mm:ss'))
        .where('type', 'password')
        .firstOrFail()
      token.isRevoked = true

      token.user.password = payload.password

      await token.save()

      // await Persona.updatePasswordByToken(request.input('token'), payload);
    } catch (e) {
      return view.render('others/message', {
        heading: 'Cannot reset your password',
        text: 'Please make sure you are using a valid and recent link to reset your password and that your passwords entered match.',
      })
    }

    return view.render('others/message', {
      heading: 'Reset password',
      text: 'Successfully reset your password. You can now login to your account using your new password.',
    })
  }

  public async account ({ auth, view, response }: HttpContextContract) {
    if (!(await auth.check())) {
      return response.redirect('/login')
    }

    const user = auth.user!

    return view.render('pages/profile/index', {
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
    })
  }

  public async edit ({ auth, request, response, session, view }: HttpContextContract) {
    const validations = schema.create({
      username: schema.string({ trim: true }, [
        rules.required(),
        rules.unique({
          table: 'users',
          column: 'username',
          whereNot: {
            username: auth.user?.username,
          },
        }),
      ]),
      email: schema.string({ trim: true }, [
        rules.required(),
        rules.email(),
        rules.unique({
          table: 'users',
          column: 'email',
          whereNot: {
            email: auth.user?.email,
          },
        }),
      ]),
      lastname: schema.string({ trim: true }, [rules.required()]),
      password: schema.string.optional({}, [rules.confirmed()]),
    })

    let data

    try {
      data = await request.validate({ schema: validations })
    } catch (exception) {
      session.flash(exception)
      session.flashExcept(['password'])
      return response.redirect('back')
    }

    /*     if (validation.fails()) {
      session.withErrors(validation.messages()).flashExcept(['password']);
      return response.redirect('back');
    } */
    /*
    // Check new username
    if (request.input('username') !== auth.user.username) {
      validation = await validateAll(request.all(), {
        username: 'required|unique:users,username',
        email: 'required',
      });
      if (validation.fails()) {
        session.withErrors(validation.messages()).flashExcept(['password']);
        return response.redirect('back');
      }
    }

    // Check new email
    if (request.input('email') !== auth.user.email) {
      validation = await validateAll(request.all(), {
        username: 'required',
        email: 'required|email|unique:users,email',
      });
      if (validation.fails()) {
        session.withErrors(validation.messages()).flashExcept(['password']);
        return response.redirect('back');
      }
    } */

    // Update user account
    const user = auth.user!
    user.username = data.username
    user.lastname = data.lastname
    user.email = data.email
    if (data.password) {
      const hashedPassword = crypto.createHash('sha256').update(data.password).digest('base64')
      user.password = hashedPassword
    }

    await user.save()

    return view.render('dashboard/account', {
      username: user.username,
      email: user.email,
      success: true,
    })
  }

  public async data ({ auth, view }: HttpContextContract) {
    const general = auth.user!
    await general.load('services')
    await general.load('workspaces')

    return view.render('dashboard/data', {
      user: general.toObject(),
    })
  }

  public async export ({ auth, response }: HttpContextContract) {
    const general = auth.user!
    await general.load('services')
    await general.load('workspaces')

    const user = general.toObject()

    const exportData = {
      username: user.username,
      lastname: user.lastname,
      mail: user.email,
      email: user.email,
      services: user.services,
      workspaces: user.workspaces,
    }

    return response
      .header('Content-Type', 'application/force-download')
      .header('Content-disposition', 'attachment; filename=export.ferdium-data')
      .send(exportData)
  }

  public async import ({ auth, request, session, response }: HttpContextContract) {
    const user = auth.user!

    console.log(request.allFiles())
    const validations = schema.create({
      file: schema.file({ extnames: ['json', 'ferdi-data', 'ferdium-data']}, [rules.required()]),
    })
    let data

    try {
      data = await request.validate({ schema: validations })
    } catch (e) {
      console.log(e)
      session.flash({
        error: 'Invalid Ferdium account file',
      })
      return response.redirect().back()
    }

    let file
    try {
      file = readJsonSync(data.file.tmpPath)
    } catch (e) {
      session.flash({
        type: 'danger',
        message: 'Invalid Ferdium account file',
      })
      return response.redirect().back()
    }

    if (!file || !file.services || !file.workspaces) {
      console.log(file)
      session.flash({
        type: 'danger',
        message: 'Invalid Ferdium account file (2)',
      })
      return response.redirect().back()
    }

    const serviceIdTranslation: {[serviceId:string]: string} = {}
    const services: Partial<Service>[] = []
    const workspaces: Partial<Workspace>[] = []

    // Import services
    try {
      for (const service of file.services) {
        // Get new, unused uuid
        let serviceId: string
        do {
          serviceId = uuid()
        } while ((await Service.findMany([{ serviceId }])).length > 0) // eslint-disable-line no-await-in-loop

        services.push({
          userId: user.id,
          serviceId,
          name: service.name,
          recipeId: service.recipeId,
          settings: service.settings,
        })

        serviceIdTranslation[service.serviceId] = serviceId
      }
    } catch (e) {
      const errorMessage = `Could not import your services into our system.\nError: ${e}`
      session.flash({
        error: errorMessage,
      })
      return response.redirect().back()
    }

    // Import workspaces
    try {
      for (const workspace of file.workspaces) {
        let workspaceId: string
        do {
          workspaceId = uuid()
        } while ((await Workspace.findMany([{ workspaceId }])).length > 0) // eslint-disable-line no-await-in-loop

        const services = workspace.services.map((service: any) => serviceIdTranslation[service])
          .filter((_: string | null | undefined) => typeof _ === 'string' && _.length > 0)

        workspaces.push({
          userId: user.id,
          workspaceId,
          name: workspace.name,
          order: workspace.order,
          services: services,
          data: workspace.data || {},
        })
      }
    } catch (e) {
      const errorMessage = `Could not import your workspaces into our system.\nError: ${e}`
      session.flash({
        error: errorMessage,
      })
      return response.redirect().back()
    }

    const trx = await Database.transaction()
    try {
      await Service.createMany(services, { client: trx })
    } catch (error) {
      await trx.rollback()

      const errorMessage = 'An error occurred while saving services data' + (Env.get('APP_DEBUG', false) ? `: ${error}` : '')
      session.flash({
        error: errorMessage,
      })
      return response.redirect().back()
    }

    try {
      await Workspace.createMany(workspaces, { client: trx })
    } catch (error) {
      await trx.rollback()

      const errorMessage = 'An error occurred while saving workspaces data' + (Env.get('APP_DEBUG', false) ? `: ${error}` : '')
      session.flash({
        error: errorMessage,
      })
      return response.redirect().back()
    }

    await trx.commit()

    session.flash({
      notification: 'Data successfully imported',
    })
    return response.redirect('/profile/' + auth.user!.id + '/data')
  }

  public logout ({ auth, response }: HttpContextContract) {
    auth.logout()
    return response.redirect('/login')
  }

  public async delete ({ auth, response }: HttpContextContract) {
    if (!(await auth.check())) {
      return response.redirect('/login')
    }
    auth.user!.delete()
    auth.logout()
    return response.redirect('/login')
  }

  public async verifyEmail ({ request, response }: HttpContextContract) {
    if (!request.hasValidSignature()) {
      return response.badRequest()
    }

    const validations = schema.create({
      email: schema.string({}, [rules.email(), rules.required(), rules.exists({ table: 'users', column: 'email' })]),
    })

    const data = await request.validate({ schema: validations });

    (await User.findByOrFail('email', data.email))
      .merge({isVerified: true})
      .save()

    return response.ok({})
  }
}
