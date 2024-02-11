import type { HttpContext } from '@adonisjs/core/http'
import { app } from '@adonisjs/core/services/app'
import path from 'node:path'
import fs from 'fs-extra'

export default class AnnouncementsController {
  public async show({ response, params }: HttpContext) {
    const announcement = path.join(app.resourcesPath(), 'announcements', `${params.version}.json`)

    if (await fs.pathExists(announcement)) {
      return response.download(announcement)
    }

    return response.status(404).send('No announcement found.')
  }
}
