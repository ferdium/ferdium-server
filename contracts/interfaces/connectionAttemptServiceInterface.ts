import {RequestContract} from '@ioc:Adonis/Core/Request'

export default interface ConnectionAttemptServiceInterface {
  attempt(request: RequestContract): void
  success(request: RequestContract): void
  check(request: RequestContract): void
  clean(key: string): void
}
