'use strict'

const Recipe = use('App/Models/Recipe');
const fetch = require('node-fetch');

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
}

module.exports = RecipeController
