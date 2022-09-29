/**
 * Contract source: https://git.io/Jte3T
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import Bouncer from '@ioc:Adonis/Addons/Bouncer'
import Recipe from 'App/Models/Recipe'
import User from 'App/Models/User'
// import Recipe from "App/Models/Recipe";
import { userHasRoles } from 'App/Services/HelpersService'

/*
|--------------------------------------------------------------------------
| Bouncer Actions
|--------------------------------------------------------------------------
|
| Actions allows you to separate your application business logic from the
| authorization logic. Feel free to make use of policies when you find
| yourself creating too many actions
|
| You can define an action using the `.define` method on the Bouncer object
| as shown in the following example
|
| ```
| 	Bouncer.define('deleteRecipe', (user: User, recipe: Recipe) => {
|			return Recipe.user_id === user.id
| 	})
| ```
|
|****************************************************************
| NOTE: Always export the "actions" const from this file
|****************************************************************
*/
export const { actions } = Bouncer
  // === USERS ADMINISTRATION ===
  .define('adminListUsers', (user: User) => {
    return userHasRoles(['admin'], user)
  })
  .define('adminCreateUser', (user: User) => {
    return userHasRoles(['admin'], user)
  })
  .define('adminEditUser', (user: User) => {
    return userHasRoles(['admin'], user)
  })
  .define('adminDeleteUser', (user: User) => {
    return userHasRoles(['admin'], user)
  })
  // === RecipeS ADMINISTRATION ===
  .define('adminViewRecipes', (user: User) => {
    return userHasRoles(['admin'], user)
  })
  .define('adminListRecipes', (user: User) => {
    return userHasRoles(['admin', 'member'], user)
  })
  .define('adminCreateRecipe', (user: User) => {
    return userHasRoles(['admin'/*, "member"*/], user)
  })
  .define('adminEditRecipe', (user: User/*, recipe: Recipe*/) => {
    if (userHasRoles(['admin'], user)) {
      return true
    }
    /*
    if (userHasRoles(["member"], user) && user.id === recipe.userId) {
      return true;
    }*/
    return false
  })
  .define('adminDeleteRecipe', (user: User/*, recipe: Recipe*/) => {
    if (userHasRoles(['admin'], user)) {
      return true
    }
    /*
    if (userHasRoles(["member"], user) && user.id === recipe.userId) {
      return true;
    }
    */
    return false
  })
  // === PROFILE ===
  .define('viewProfile', (user: User, profile: User) => {
    return userHasRoles(['admin'], user) || user.id === profile.id
  })
  .define('editProfile', (user: User, profile: User) => {
    return userHasRoles(['admin'], user) || user.id === profile.id
  })
  .define('dataProfile', (user: User, profile: User) => {
    return userHasRoles(['admin'], user) || user.id === profile.id
  })
  // === RECIPE ===
  .define('viewRecipe', (user: User, _recipe: Recipe) => {
    return userHasRoles(['admin'], user) || (user.isVerified || user.emailVerified)
  })
  .define('downloadRecipe', (user: User, _recipe: Recipe) => {
    return userHasRoles(['admin'], user) || (user.isVerified || user.emailVerified)
  })
  .define('searchRecipe', (user: User) => {
    return userHasRoles(['admin'], user) || (user.isVerified || user.emailVerified)
  })

/*
|--------------------------------------------------------------------------
| Bouncer Policies
|--------------------------------------------------------------------------
|
| Policies are self contained actions for a given resource. For example: You
| can create a policy for a "User" resource, one policy for a "Recipe" resource
| and so on.
|
| The "registerPolicies" accepts a unique policy name and a function to lazy
| import the policy
|
| ```
| 	Bouncer.registerPolicies({
|			UserPolicy: () => import('App/Policies/User'),
| 		RecipePolicy: () => import('App/Policies/Recipe')
| 	})
| ```
|
|****************************************************************
| NOTE: Always export the "policies" const from this file
|****************************************************************
*/
export const { policies } = Bouncer.registerPolicies({})
