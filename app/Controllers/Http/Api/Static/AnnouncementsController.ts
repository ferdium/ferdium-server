import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Application from '@ioc:Adonis/Core/Application';
import path from 'node:path';
import fs from 'fs-extra';

export default class AnnouncementsController {
  public async show({ response, params }: HttpContextContract) {
    const announcement = path.join(
      Application.resourcesPath(),
      'announcements',
      `${params.version}.json`,
    );

    if (await fs.pathExists(announcement)) {
      return response.download(announcement);
    }

    return response.status(404).send('No announcement found.');
  }
}
