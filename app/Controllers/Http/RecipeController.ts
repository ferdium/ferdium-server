import * as path from 'path'
import * as fs from 'fs-extra'
import * as semver from 'semver'
import Recipe from 'App/Models/Recipe'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Drive from '@ioc:Adonis/Core/Drive'
import Application from '@ioc:Adonis/Core/Application'
import { DownloadRecipeValidator, SearchRecipeValidator, UpdateRecipeValidator } from 'App/Validators/RecipeValidator'
import Service from 'App/Models/Service'

export default class RecipeController {
  private entityModel = Recipe

  // List official and custom recipes
  public async list ({ response }: HttpContextContract) {
    const officialRecipes = fs.readJsonSync(path.join(Application.appRoot, 'recipes', 'all.json'))

    const customRecipesArray = await this.entityModel.all()
    const customRecipes = customRecipesArray.map((recipe) => ({
      id: recipe.recipeId,
      name: recipe.name,
      ...(typeof recipe.data === 'string' ? JSON.parse(recipe.data) : recipe.data),
    }))

    const recipes = [...officialRecipes, ...customRecipes]

    return response.send(recipes)
  }

  public async index ({ response }: HttpContextContract) {
    const officialRecipes = fs.readJsonSync(path.join(Application.appRoot, 'recipes', 'all.json'))

    const customRecipesArray = await this.entityModel.all()
    const customRecipes = customRecipesArray.map((recipe) => ({
      id: recipe.recipeId,
      name: recipe.name,
      ...(typeof recipe.data === 'string' ? JSON.parse(recipe.data) : recipe.data),
    }))

    const recipes = [...officialRecipes, ...customRecipes]

    return response.send(recipes)
  }

  public async show ({ view, request, bouncer }: HttpContextContract) {
    const officialRecipes: Recipe[] = fs.readJsonSync(path.join(Application.appRoot, 'recipes', 'all.json'))

    const customRecipesArray = await this.entityModel.all()
    const customRecipes: Recipe[] = customRecipesArray.map((recipe) => ({
      id: recipe.recipeId,
      name: recipe.name,
      ...(typeof recipe.data === 'string' ? JSON.parse(recipe.data) : recipe.data),
    }))

    const recipes = [...officialRecipes, ...customRecipes].map((_: any) => {
      _.featured = !!_.featured
      _.recipeId = _.id
      return _
    })

    const recipe = recipes.find(_ => _.recipeId === request.param('id'))

    if (!recipe) {
      return view.render('errors/not-found')
    }

    await bouncer.authorize('viewRecipe', recipe!)

    const aggregates = await Service.query().select('recipe_id').groupBy('recipe_id').count('recipe_id', 'count')

    const aggregate = aggregates.find(_ => _.recipeId == recipe.recipeId)?.$extras.count

    return view.render('pages/recipes/details', { recipe, aggregate})
  }

  // Search official and custom recipes
  public async search ({ request, response, bouncer }: HttpContextContract) {
    bouncer.authorize('searchRecipe')

    const data = await request.validate(SearchRecipeValidator)

    const { needle } = data

    // Get results
    let results

    if (needle === 'ferdium:custom') {
      const dbResults = await this.entityModel.all()
      results = dbResults.map((recipe) => ({
        id: recipe.recipeId,
        name: recipe.name,
        ...recipe.data,
      }))
    } else {
      const localResultsArray = await this.entityModel.query().whereILike('name', `%${needle}%`)
      results = localResultsArray.map((recipe) => ({
        id: recipe.recipeId,
        name: recipe.name,
        ...recipe.data,
      }))
    }

    return response.ok(results)
  }

  public popularRecipes ({ response }) {
    return response.ok(
      fs
        .readJsonSync(Application.makePath('recipes', 'all.json'))
        .filter((recipe) => recipe.featured),
    )
  }

  public update ({ request, response }: HttpContextContract) {
    const updates: string[] = []
    const recipes = request.all()
    const allJson = fs.readJsonSync(path.join(Application.appRoot, 'recipes', 'all.json'))

    for (const recipe of Object.keys(recipes)) {
      const version = recipes[recipe]

      // Find recipe in local recipe repository
      const localRecipe = allJson.find((r) => r.id === recipe)
      if (localRecipe && semver.lt(version, localRecipe.version)) {
        updates.push(recipe)
      }
    }

    return response.ok(updates)
  }

  // Download a recipe
  public async download ({ response, request, bouncer }: HttpContextContract) {
    const data = await request.validate(DownloadRecipeValidator)

    const recipe = await this.entityModel.query().where('recipe_id', data.recipe).firstOrFail()

    bouncer.authorize('downloadRecipe', recipe)

    // Check if recipe exists in recipes folder
    if (await Drive.use('cloudinary').exists(`archives/${recipe.recipeId}.tar.gz`)) {
      return response.type('.tar.gz').stream(await Drive.use('cloudinary').getStream(`archives/${recipe.recipeId}.tar.gz`))
    }

    return response.badRequest({
      message: 'Recipe not found',
      code: 'recipe-not-found',
    })
  }
}
