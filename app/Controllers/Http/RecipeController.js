'use strict'

const Recipe = use('App/Models/Recipe');
const Helpers = use('Helpers')
const Drive = use('Drive')
const fetch = require('node-fetch');
const path = require('path');

class RecipeController {
  async list({
    response
  }) {
    const officialRecipes = JSON.parse(await (await fetch('https://api.franzinfra.com/v1/recipes')).text());
    const customRecipesArray = (await Recipe.all()).rows;
    const customRecipes = customRecipesArray.map(recipe => ({
      "id": recipe.recipeId,
      "name": recipe.name,
      ...JSON.parse(recipe.data)
    }))

    const recipes = [
      ...officialRecipes,
      ...customRecipes,
    ]

    return response.send(recipes)
  }

  async create({
    request,
    response
  }) {
    const data = request.all();

    const pkg = request.file('package')

    await pkg.move(path.join(Helpers.appRoot(), '/recipes/'), {
      name: data.id + '.tar.gz',
      overwrite: false
    })

    await Recipe.create({
      name: data.name,
      recipeId: data.id,
      data: JSON.stringify({
        "author": data.author,
        "featured": false,
        "version": "1.0.0",
        "icons": {
          "png": data.png,
          "svg": data.svg
        }
      })
    })

    return response.send('Created new recipe')
  }

  async search({
      request,
      response
  }) {
    const needle = request.input('needle')

    const remoteResults = JSON.parse(await (await fetch('https://api.franzinfra.com/v1/recipes/search?needle=' + needle)).text());
    const localResultsArray = (await Recipe.query().where('name', 'LIKE', '%' + needle + '%').fetch()).toJSON();
    const localResults = localResultsArray.map(recipe => ({
        "id": recipe.recipeId,
        "name": recipe.name,
        ...JSON.parse(recipe.data)
    }))

    const results = [
        ...localResults,
        ...remoteResults,
    ]

    return response.send(results);
  }

  // Download a recipe
  async download({
    request,
    response,
    params
  }) {
    const service = params.recipe;

    // Chack for invalid characters
    if (/\.{1,}/.test(service) || /\/{1,}/.test(service)) {
        return response.send('Invalid recipe name');
    }

    // Check if recipe exists in recipes folder
    if (await Drive.exists(service + '.tar.gz')) {
        response.send(await Drive.get(service + '.tar.gz'))
    } else {
        response.redirect('https://api.franzinfra.com/v1/recipes/download/' + service)
    }
  }
}

module.exports = RecipeController
