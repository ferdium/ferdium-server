import NodeCache from 'node-cache'
import { DateTime } from 'luxon'
import ConnectionAttemptLimit from 'Config/connectionAttemptLimit'
import ConnectionAttemptException from 'App/Exceptions/ConnectionAttemptException'
import { RequestContract } from '@ioc:Adonis/Core/Request'
import ConnectionAttemptServiceInterface from 'Contracts/interfaces/connectionAttemptServiceInterface'

interface ConnectionAttemptInterface {
  date: DateTime
}

export default class ConnectionAttemptService implements ConnectionAttemptServiceInterface {
  private cache: NodeCache
  constructor () {
    this.cache = new NodeCache()
    setInterval(() => {
      this.cache.keys().forEach((keyCache) => {
        this.clean(keyCache)
      })
    }, 1000 * 60 * 60 * ConnectionAttemptLimit.periodInHours) // clean old cache memory
  }

  public attempt (request: RequestContract) {
    const connectionAttempt: [ConnectionAttemptInterface] = [{ date: DateTime.now() }]
    let allConnectionAttempts
    if (this.cache.has(request.ip() + request.url(false))) {
      const connectionAttempts: [ConnectionAttemptInterface] | undefined = this.cache.get<[ConnectionAttemptInterface]>(request.ip() + request.url(false))
      if (connectionAttempts) {
        allConnectionAttempts = connectionAttempt.concat(connectionAttempts)
      } else {
        allConnectionAttempts = connectionAttempt
      }
    } else {
      allConnectionAttempts = connectionAttempt
    }
    this.cache.set<[ConnectionAttemptInterface]>(request.ip() + request.url(false), allConnectionAttempts)
  }

  public success (request: RequestContract) {
    this.cache.del(request.ip() + request.url(false))
  }

  public clean (key: string) {
    let connectionAttempts: ConnectionAttemptInterface[] | undefined = this.cache.get<ConnectionAttemptInterface[]>(key)
    if (connectionAttempts) {
      connectionAttempts.forEach(function (connectionAttempt: ConnectionAttemptInterface, key) {
        if (connectionAttempt.date < DateTime.now().minus({ hours: ConnectionAttemptLimit.periodInHours })) {
          if (connectionAttempts) {
            delete connectionAttempts[key]
          }
        }
      })
      connectionAttempts = connectionAttempts.filter((element) => {
        return element !== null
      })
    }
    this.cache.set(key, connectionAttempts)
  }

  public check (request: RequestContract) {
    this.clean(request.ip() + request.url(false))
    let connectionAttempts: ConnectionAttemptInterface[] | undefined = this.cache.get<ConnectionAttemptInterface[]>(request.ip() + request.url(false))
    if (connectionAttempts?.length && connectionAttempts.length >= ConnectionAttemptLimit.maxAttempts) {
      throw new ConnectionAttemptException()
    }
  }
}
