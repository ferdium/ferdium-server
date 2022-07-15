export default class HealthController {
  public async index() {
    // TODO: Actually do something instead of alwayas returning success.

    return {
      api: 'success',
      db: 'success',
    };
  }
}
