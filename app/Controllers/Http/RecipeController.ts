import type { HttpContext } from '@adonisjs/core/http';
import fs from 'fs-extra';
import { app } from '@adonisjs/core/services/app';
import path from 'node:path';
import Recipe from '#app/Models/Recipe';
import { isCreationEnabled } from '#config/app';
import { validator, schema, rules } from '@adonisjs/validator';
import targz from 'targz';
import semver from 'semver';
import Drive from '@ioc:Adonis/Core/Drive';

// TODO: This file needs to be refactored and cleaned up to include types

const createSchema = schema.create({
  name: schema.string(),
  id: schema.string([rules.unique({ table: 'recipes', column: 'recipeId' })]),
  // TODO: Check if this is correct
  //   author: 'required|accepted',
  author: schema.string(),
  svg: schema.string([rules.url()]),
});

const searchSchema = schema.create({
  needle: schema.string(),
});

const downloadSchema = schema.create({
  // TODO: Check if this is correct
  //   recipe: 'required|accepted',
  recipe: schema.string(),
});

const compress = (src: string, dest: string) =>
  new Promise((resolve, reject) => {
    targz.compress(
      {
        src,
        dest,
      },
      err => {
        if (err) {
          reject(err);
        } else {
          resolve(dest);
        }
      },
    );
  });

export default class RecipesController {
  // List official and custom recipes
  public async list({ response }: HttpContext) {
    const officialRecipes = fs.readJsonSync(
      path.join(app.appRoot, 'recipes', 'all.json'),
    );
    const customRecipesArray = await Recipe.all();
    const customRecipes = customRecipesArray.map(recipe => ({
      id: recipe.recipeId,
      name: recipe.name,
      ...(typeof recipe.data === 'string'
        ? JSON.parse(recipe.data)
        : recipe.data),
    }));

    const recipes = [...officialRecipes, ...customRecipes];

    return response.send(recipes);
  }

  // TODO: Test this endpoint
  // Create a new recipe using the new.html page
  public async create({ request, response }: HttpContext) {
    // Check if recipe creation is enabled
    if (isCreationEnabled === 'false') {
      return response.send(
        "This server doesn't allow the creation of new recipes.",
      );
    }

    // Validate user input
    let data;
    try {
      data = await request.validate({ schema: createSchema });
    } catch (error) {
      return response.status(401).send({
        message: 'Invalid POST arguments',
        messages: error.messages,
        status: 401,
      });
    }

    if (!data.id) {
      return response.send('Please provide an ID');
    }

    // Check for invalid characters
    if (/\.+/.test(data.id) || /\/+/.test(data.id)) {
      return response.send(
        'Invalid recipe name. Your recipe name may not contain "." or "/"',
      );
    }

    // Clear temporary recipe folder
    await fs.emptyDir(app.tmpPath('recipe'));

    // Move uploaded files to temporary path
    const files = request.file('files');
    if (!files) {
      return response.abort('Error processsing files.');
    }
    await files.move(app.tmpPath('recipe'));

    // Compress files to .tar.gz file
    const source = app.tmpPath('recipe');
    const destination = path.join(
      app.appRoot,
      `/recipes/archives/${data.id}.tar.gz`,
    );

    compress(source, destination);

    // Create recipe in db
    await Recipe.create({
      name: data.name,
      recipeId: data.id,
      // @ts-expect-error
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
  public async search({ request, response }: HttpContext) {
    // Validate user input
    let data;
    try {
      data = await request.validate({ schema: searchSchema });
    } catch (error) {
      return response.status(401).send({
        message: 'Please provide a needle',
        messages: error.messages,
        status: 401,
      });
    }

    const { needle } = data;

    // Get results
    let results;

    if (needle === 'ferdium:custom') {
      const dbResults = await Recipe.all();
      results = dbResults.map(recipe => ({
        id: recipe.recipeId,
        name: recipe.name,
        ...(typeof recipe.data === 'string'
          ? JSON.parse(recipe.data)
          : recipe.data),
      }));
    } else {
      const localResultsArray = await Recipe.query().where(
        'name',
        'LIKE',
        `%${needle}%`,
      );
      results = localResultsArray.map(recipe => ({
        id: recipe.recipeId,
        name: recipe.name,
        ...(typeof recipe.data === 'string'
          ? JSON.parse(recipe.data)
          : recipe.data),
      }));
    }

    return response.send(results);
  }

  public popularRecipes({ response }: HttpContext) {
    return response.send(
      fs
        .readJsonSync(path.join(app.appRoot, 'recipes', 'all.json'))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((recipe: any) => recipe.featured),
    );
  }

  // TODO: test this endpoint
  public update({ request, response }: HttpContext) {
    const updates = [];
    const recipes = request.all();
    const allJson = fs.readJsonSync(
      path.join(app.appRoot, 'recipes', 'all.json'),
    );

    for (const recipe of Object.keys(recipes)) {
      const version = recipes[recipe];

      // Find recipe in local recipe repository
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const localRecipe = allJson.find((r: any) => r.id === recipe);
      if (localRecipe && semver.lt(version, localRecipe.version)) {
        updates.push(recipe);
      }
    }

    return response.send(updates);
  }

  // TODO: test this endpoint
  // Download a recipe
  public async download({ response, params }: HttpContext) {
    // Validate user input
    let data;
    try {
      data = await validator.validate({
        data: params,
        schema: downloadSchema,
      });
    } catch (error) {
      return response.status(401).send({
        message: 'Please provide a recipe ID',
        messages: error.messages,
        status: 401,
      });
    }

    const service = data.recipe;

    // Check for invalid characters
    if (/\.+/.test(service) || /\/+/.test(service)) {
      return response.send('Invalid recipe name');
    }

    // Check if recipe exists in recipes folder
    if (await Drive.exists(`${service}.tar.gz`)) {
      return response
        .type('.tar.gz')
        .send(await Drive.get(`${service}.tar.gz`));
    }

    return response.status(400).send({
      message: 'Recipe not found',
      code: 'recipe-not-found',
    });
  }
}
