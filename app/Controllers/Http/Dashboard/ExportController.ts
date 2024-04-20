import type { HttpContext } from '@adonisjs/core/http';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepParseToJSON(obj: any): Record<string, unknown> {
  if (typeof obj !== 'object' || obj === null) {
    try {
      // Try to parse the object as JSON
      return JSON.parse(obj) as Record<string, unknown>;
    } catch {
      // If parsing fails, return the original value
      return obj;
    }
  }

  // If obj is an object, recursively parse its keys
  if (Array.isArray(obj)) {
    // If obj is an array, recursively parse each element
    return obj.map(item => deepParseToJSON(item)) as unknown as Record<
      string,
      unknown
    >;
  } else {
    // If obj is an object, recursively parse its keys
    const parsedObj: Record<string, unknown> = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        parsedObj[key] = deepParseToJSON(obj[key]);
      }
    }
    return parsedObj;
  }
}

export default class ExportController {
  /**
   * Display the export page
   */
  public async show({ auth, response }: HttpContext) {
    const user = auth.user!;
    const services = await user.related('services').query();
    const workspaces = await user.related('workspaces').query();

    const exportData = {
      username: user.username,
      lastname: user.lastname,
      mail: user.email,
      services: deepParseToJSON(JSON.parse(JSON.stringify(services))),
      workspaces: deepParseToJSON(JSON.parse(JSON.stringify(workspaces))),
    };

    return response
      .header('Content-Type', 'application/force-download')
      .header('Content-disposition', 'attachment; filename=export.ferdium-data')
      .send(exportData);
  }
}
