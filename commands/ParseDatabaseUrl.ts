import { args, BaseCommand } from '@adonisjs/core/build/standalone'
import Url from 'url'

export default class ParseDatabaseUrl extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'parse:database-url'

  /**
   * Command description is displayed in the "help" output
   */
  public static description = 'Parse database connection url to env variables'

  public static settings = {
    loadApp: false,
    stayAlive: false,
  }

  @args.string({ required: true, description: 'The url to be parsed' })
  public url: string

  public async run () {
    const parsed = Url.parse(this.url, true)
    const credentials = {
      username: parsed.auth?.split(':')[0],
      password: parsed.auth?.split(':')[1],
    }

    const database = parsed.pathname?.startsWith('/')
      ? parsed.pathname.substring(1)
      : parsed.pathname
    const connection = ((_) => {
      if (_?.endsWith(':')) {
        _ = _.substring(0, _.length - 1)
      }
      switch (_) {
        case 'postgres':
          return 'pg'
        case 'mysql':
        case 'mariadb':
          return 'mysql'
        default:
          return 'pg'
      }
    })(parsed.protocol)

    const { useSsl } = parsed?.query
    const { hostname, port } = parsed
    const { username, password } = credentials

    console.log('DB_CONNECTION=' + connection)
    console.log('DB_DATABASE=' + database)
    console.log('DB_HOST=' + hostname)
    console.log('DB_PASSWORD=' + password)
    if (port) {
      console.log('DB_PORT=' + port)
    } else {
      console.log(
        'DB_PORT=' +
          ((_) => {
            switch (_) {
              case 'pg':
                return 5432
              case 'mysql':
                return 3306
              default:
                return ''
            }
          })(connection),
      )
    }
    console.log(
      'DB_SSL=' +
        (['1', 'true'].includes(useSsl?.toString().toLowerCase() || '') ? 'true' : 'false'),
    )
    console.log('DB_USER=' + username)
  }
}
