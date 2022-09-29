import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

function customMessages () {
  return {
    'name.required': 'Name field is required',
    'recipeId.required': 'Identifier field is required',
    'recipeId.slugLike': 'Identifier cannot contain "." or "/"',
    'svg.required': 'Icon field is required',
  }
}

export class CreateRecipeValidator {
  constructor (protected ctx: HttpContextContract) { }

  public schema = schema.create({
    name: schema.string({ trim: true }),
    author: schema.string.optional({ trim: true }),
    recipeId: schema.string({ trim: true }, [rules.slugLike(), rules.required(), rules.unique({ table: 'recipes', column: 'recipe_id' })]),
    files: schema.array([rules.required()]).members(schema.file({}, [])),
    svg: schema.string({ trim: true }, [rules.required(), rules.url()]),
  })

  public messages = customMessages()
}

export class UpdateRecipeValidator {
  constructor (protected ctx: HttpContextContract) { }

  public schema = schema.create({
    id: schema.number(),
    name: schema.string({ trim: true }),
    author: schema.string.optional({ trim: true }),
    recipeId: schema.string({ trim: true }, [rules.slugLike(), rules.required(), rules.unique({ table: 'recipes', column: 'recipe_id' })]),
    files: schema.array([rules.required()]).members(schema.file({}, [])),
    svg: schema.string({ trim: true }, [rules.required(), rules.url()]),
  })

  public messages = customMessages()
}

export class DownloadRecipeValidator {
  constructor (protected ctx: HttpContextContract) { }

  public schema = schema.create({
    recipe: schema.string({ trim: true }, [rules.slugLike(), rules.required(), rules.exists({ table: 'recipes', column: 'recipe_id' })]),
  })

  public messages = customMessages()
}

export class SearchRecipeValidator {
  constructor (protected ctx: HttpContextContract) { }

  public schema = schema.create({
    needle: schema.string({ trim: true }, [rules.slugLike(), rules.required()]),
  })

  public messages = customMessages()
}
