import { ConfirmDeleteOptions } from 'App/types'
import { RoleId } from 'App/types'
import User from 'App/Models/User'

export function createConfirmDeleteLink (params: ConfirmDeleteOptions) {
  let vars: string[] = []
  for (const property in params) {
    vars.push(`${property}=${params[property]}`)
  }
  const url = `/admin/confirm-delete?${vars.join('&')}`
  return url
}

/**
 * returns true if user has ONE of the roles.
 */
export function userHasRoles (roles: RoleId[], user: User) {
  // special case: if user has role root, he is authorized
  // to do anything any role can do, so return true.
  if (user.roles.includes('root')) {
    return true
  }
  for (const role of roles) {
    if (user.roles.includes(role)) {
      return true
    }
  }
  return false
}
