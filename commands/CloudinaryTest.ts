import { BaseCommand } from '@adonisjs/core/build/standalone'
import Drive from '@ioc:Adonis/Core/Drive'

export default class CloudinaryTest extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'cloudinary:test'

  /**
   * Command description is displayed in the "help" output
   */
  public static description = ''

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command. Don't forget to call `node ace generate:manifest`
     * afterwards.
     */
    loadApp: true,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process. Don't forget to call
     * `node ace generate:manifest` afterwards.
     */
    stayAlive: false,
  }

  public async run () {
    await Drive.use('cloudinary').put(
      '/ce6c48f3-55ce-43cf-8b8e-db66ba850b61/testo.txt',
      'Hello World!',
    )
  }
}
