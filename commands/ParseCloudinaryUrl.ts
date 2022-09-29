import { args, BaseCommand } from '@adonisjs/core/build/standalone'
import Url from 'url'

export default class ParseCloudinaryUrl extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'parse:cloudinary-url'

  /**
   * Command description is displayed in the "help" output
   */
  public static description = 'Parse cloudinary connection url to env variables'

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

    const { useSsl, secure } = parsed?.query
    const { hostname } = parsed
    const { username, password } = credentials

    console.log('CLOUDINARY_CLOUD_NAME=' + hostname)
    console.log('CLOUDINARY_API_KEY=' + username)
    console.log('CLOUDINARY_API_SECRET=' + password)
    console.log(
      'CLOUDINARY_SECURE=' +
        (['1', 'true'].includes(
          useSsl?.toString()?.toLowerCase() || secure?.toString()?.toLowerCase() || '',
        )
          ? 'true'
          : 'false'),
    )
  }
}
