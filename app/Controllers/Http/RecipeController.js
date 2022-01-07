const Recipe = use('App/Models/Recipe');
const Helpers = use('Helpers');
const Drive = use('Drive');
const {
  validateAll,
} = use('Validator');
const Env = use('Env');

const targz = require('targz');
const path = require('path');
const fs = require('fs-extra');
const semver = require('semver');

const compress = (src, dest) => new Promise((resolve, reject) => {
  targz.compress({
    src,
    dest,
  }, (err) => {
    if (err) {
      reject(err);
    } else {
      resolve(dest);
    }
  });
});

class RecipeController {
  // List official and custom recipes
  async list({
    response,
  }) {
    const officialRecipes = fs.readJsonSync(path.join(Helpers.appRoot(), 'recipes', 'all.json'));
    const customRecipesArray = (await Recipe.all()).rows;
    const customRecipes = customRecipesArray.map((recipe) => ({
      id: recipe.recipeId,
      name: recipe.name,
      ...typeof recipe.data === 'string' ? JSON.parse(recipe.data) : recipe.data,
    }));

    const recipes = [
      ...officialRecipes,
      ...customRecipes,
    ];

    return response.send(recipes);
  }

  // Create a new recipe using the new.html page
  async create({
    request,
    response,
  }) {
    // Check if recipe creation is enabled
    if (Env.get('IS_CREATION_ENABLED') == 'false') { // eslint-disable-line eqeqeq
      return response.send('This server doesn\'t allow the creation of new recipes.');
    }

    // Validate user input
    const validation = await validateAll(request.all(), {
      name: 'required|string',
      id: 'required|unique:recipes,recipeId',
      author: 'required|accepted',
      svg: 'required|url',
    });
    if (validation.fails()) {
      return response.status(401).send({
        message: 'Invalid POST arguments',
        messages: validation.messages(),
        status: 401,
      });
    }

    const data = request.all();

    if (!data.id) {
      return response.send('Please provide an ID');
    }

    // Check for invalid characters
    if (/\.{1,}/.test(data.id) || /\/{1,}/.test(data.id)) {
      return response.send('Invalid recipe name. Your recipe name may not contain "." or "/"');
    }

    // Clear temporary recipe folder
    await fs.emptyDir(Helpers.tmpPath('recipe'));

    // Move uploaded files to temporary path
    const files = request.file('files');
    await files.moveAll(Helpers.tmpPath('recipe'));

    // Compress files to .tar.gz file
    const source = Helpers.tmpPath('recipe');
    const destination = path.join(Helpers.appRoot(), `/recipes/archives/${data.id}.tar.gz`);

    compress(
      source,
      destination,
    );

    // Create recipe in db
    await Recipe.create({
      name: data.name,
      recipeId: data.id,
      data: JSON.stringify({
        author: data.author,
        featured: false,
        version: '1.0.0',
        icons: {
          svg: data.svg,
        },
      }),
    });

    return response.send('Created new recipe');
  }

  // Search official and custom recipes
  async search({
    request,
    response,
  }) {
    // Validate user input
    const validation = await validateAll(request.all(), {
      needle: 'required',
    });
    if (validation.fails()) {
      return response.status(401).send({
        message: 'Please provide a needle',
        messages: validation.messages(),
        status: 401,
      });
    }

    const needle = request.input('needle');

    // Get results
    let results;

    if (needle === 'ferdi:custom') {
      const dbResults = (await Recipe.all()).toJSON();
      results = dbResults.map((recipe) => ({
        id: recipe.recipeId,
        name: recipe.name,
        ...typeof recipe.data === 'string' ? JSON.parse(recipe.data) : recipe.data,
      }));
    } else {
      const localResultsArray = (await Recipe.query().where('name', 'LIKE', `%${needle}%`).fetch()).toJSON();
      results = localResultsArray.map((recipe) => ({
        id: recipe.recipeId,
        name: recipe.name,
        ...typeof recipe.data === 'string' ? JSON.parse(recipe.data) : recipe.data,
      }));
    }

    return response.send(results);
  }

  popularRecipes({
    response,
  }) {
    return response.send(
      fs
        .readJsonSync(path.join(
          Helpers.appRoot(), 'recipes', 'all.json',
        ))
        .filter((recipe) => recipe.featured),
    );
  }

  update({ request, response }) {
    const updates = [];
    const recipes = request.all();
    const allJson = fs.readJsonSync(path.join(
      Helpers.appRoot(), 'recipes', 'all.json',
    ));

    for (const recipe of Object.keys(recipes)) {
      const version = recipes[recipe];

      // Find recipe in local recipe repository
      const localRecipe = allJson.find(r => r.id === recipe);
      if (localRecipe && semver.lt(version, localRecipe.version)) {
        updates.push(recipe);
      }
    }

    return response.send(updates);
  }

  // Download a recipe
  async download({
    response,
    params,
  }) {
    // Validate user input
    const validation = await validateAll(params, {
      recipe: 'required|accepted',
    });
    if (validation.fails()) {
      return response.status(401).send({
        message: 'Please provide a recipe ID',
        messages: validation.messages(),
        status: 401,
      });
    }

    const service = params.recipe;

    // Check for invalid characters
    if (/\.{1,}/.test(service) || /\/{1,}/.test(service)) {
      return response.send('Invalid recipe name');
    }

    // Check if recipe exists in recipes folder
    if (await Drive.exists(`${service}.tar.gz`)) {
      return response.type('.tar.gz').send(await Drive.get(`${service}.tar.gz`));
    }

    return response.status(400).send({
      message: 'Recipe not found',
      code: 'recipe-not-found',
    });
  }
}

module.exports = RecipeController;
