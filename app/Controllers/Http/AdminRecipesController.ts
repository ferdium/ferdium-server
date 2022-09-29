import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import {
  CreateRecipeValidator,
  UpdateRecipeValidator,
} from 'App/Validators/RecipeValidator'
import { createConfirmDeleteLink } from 'App/Services/HelpersService'
import Recipe from 'App/Models/Recipe'
import Env from '@ioc:Adonis/Core/Env'
import targz from 'targz'
import fs from 'fs-extra'
import Drive from '@ioc:Adonis/Core/Drive'
import Application from '@ioc:Adonis/Core/Application'
import { v4 as uuid } from 'uuid'
import Database from '@ioc:Adonis/Lucid/Database'
import Sentry from '@ioc:Adonis/Addons/Sentry'
import { safeStringify } from '@poppinss/utils'

const compress = (src: string, dest: string) =>
  new Promise((resolve, reject) => {
    targz.compress(
      {
        src,
        dest,
      },
      (err) => {
        if (err) {
          reject(err)
        } else {
          resolve(dest)
        }
      },
    )
  })

export default class AdminRecipesController {
  // controller config
  private entityModel = Recipe
  private entityListPath = '/admin/recipes'
  private entityIndexView = 'pages/admin/recipes'
  private entityFormView = 'pages/admin/recipeForm'
  private entityCreateValidator = CreateRecipeValidator
  private entityFormAction = (entity: InstanceType<typeof this.entityModel>) => {
    return '/admin/recipes/' + entity.id
  }
  private entityCreationNotification = () => 'Recipe has been created'
  private entityUpdateNotification = () => 'Recipe has been updated'
  private entityDeleteNotification = () => 'Recipe has been deleted'

  /**
   * Liste des posts pour l'admin
   */
  public async index ({ view, request, bouncer }: HttpContextContract) {
    await bouncer.authorize('adminListRecipes')
    const page = request.input('page', 1)
    const limit = 20
    const entities = await this.entityModel.query()
      .select('recipes.*')
      .paginate(page, limit)
    entities.baseUrl(this.entityListPath)

    // add delete links and edit Links for each post.
    entities.forEach((entity) => {
      const deleteLink = createConfirmDeleteLink({
        id: entity.id,
        title: `Are you sure you want to delete "${entity.name}" ?`,
        formAction: `${this.entityListPath}/${entity.id}?_method=DELETE`,
        returnUrl: this.entityListPath,
      })
      entity.$extras._deleteLink = deleteLink
      entity.$extras._editLink = `${this.entityListPath}/${entity.id}/edit`
    })

    return view.render(this.entityIndexView, { entities })
  }

  public async create ({ view, bouncer }: HttpContextContract) {
    await bouncer.authorize('adminCreateRecipe')
    const formValues = this.initFormValues()
    return view.render(this.entityFormView, {
      formValues,
      formAction: this.entityListPath,
    })
  }

  public async store ({
    session,
    request,
    response,
    // auth,
    bouncer,
  }: HttpContextContract) {
    await bouncer.authorize('adminCreateRecipe')

    // Check if recipe creation is enabled
    if (Env.get('IS_CREATION_ENABLED') == 'false') {
      return response.ok('This server doesn\'t allow the creation of new recipes.')
    }

    const payload = await request.validate(this.entityCreateValidator)

    const timestamp = Date.now() + uuid()

    const filename = `${payload.recipeId}.tar.gz`
    const source = Application.tmpPath(timestamp, 'recipe')
    const destination = Application.tmpPath(timestamp, filename)

    const trx = await Database.transaction()
    try {
      // Clear temporary recipe folder
      fs.emptyDirSync(source)

      // Move uploaded files to temporary path
      const files = request.files('files')
      for (const file of files) {
        await file.move(source)
      }

      // Compress files to .tar.gz file
      await compress(source, destination)

      await Drive.use('cloudinary')
        .putStream(`recipes/archives/${filename}`, fs.createReadStream(destination),
          { metadata: { author: payload.author || '', version: '1.0.0', name: payload.name, id: payload.recipeId }, resource_type: 'raw' })

      fs.removeSync(Application.tmpPath(timestamp))

      // Create recipe in db
      await this.entityModel.create({
        name: payload.name,
        recipeId: payload.recipeId,
        data: {
          author: payload.author,
          featured: false,
          version: '1.0.0',
          icons: {
            svg: payload.svg,
          },
        },
      }, { client: trx })
    } catch (error) {
      Sentry.captureMessage(safeStringify(error), Sentry.Severity.Critical)

      try {
        await trx.rollback()
      } catch {}

      try {
        fs.removeSync(Application.tmpPath(timestamp))
      } catch {}

      try {
        await Drive.use('cloudinary').delete(`recipes/archives/${filename}`)
      } catch {}

      session.flash({
        error: 'Error occurredd while creating recipe' + (Env.get('APP_DEBUG', false) ? `: ${safeStringify(error)}` : ''),
      })
      return response.redirect().back()
    }

    await trx.commit()

    session.flash({
      notification: this.entityCreationNotification(),
    })

    return response.redirect(this.entityListPath)
  }

  public async show ({}: HttpContextContract) {}

  public async edit ({ view, request, bouncer }: HttpContextContract) {
    const entity = await this.entityModel.findOrFail(request.param('id'))
    await bouncer.authorize('adminEditRecipe'/*, entity*/)
    if (entity) {
      const formValues = this.initFormValues(entity)
      return view.render(this.entityFormView, {
        formValues,
        formAction: this.entityFormAction(entity) + '?_method=PUT',
      })
    }
  }

  public async update ({
    request,
    session,
    response,
    bouncer,
  }: HttpContextContract) {
    const payload = await request.validate(UpdateRecipeValidator)
    const entity = await this.entityModel.findOrFail(payload.id)
    bouncer.authorize('adminEditRecipe'/*, entity*/)
    entity.name = payload.name
    entity.data = {...(entity.data || {}),
      author: payload.author,
      icons: {
        svg: payload.svg,
      },
    }
    entity.recipeId = payload.recipeId
    await entity.save()
    session.flash({ notification: this.entityUpdateNotification() })
    response.redirect(this.entityListPath)
  }

  public async destroy ({
    request,
    response,
    session,
    bouncer,
  }: HttpContextContract) {
    const entity = await this.entityModel.findOrFail(request.param('id'))
    await bouncer.authorize('adminDeleteRecipe'/*, entity*/)
    if (entity) {
      try {
        await Drive.use('cloudinary').delete(`recipes/archives/${entity.recipeId}.tar.gz`)
      } catch { }
      entity.delete()
      session.flash({ notification: this.entityDeleteNotification() })
      response.redirect(this.entityListPath)
    }
  }

  private initFormValues (recipe?: InstanceType<typeof this.entityModel>) {
    const formValues = {
      recipeId: recipe?.recipeId || '',
      name: recipe?.name || '',
      author: recipe?.data?.author || '',
      svg: recipe?.data?.svg || '',
    }
    return formValues
  }
}
