export default class NoTimestamp {
  public register (Model: any): void {
    Object.defineProperties(Model, {
      createdAtColumn: {
        get: () => null,
      },
      updatedAtColumn: {
        get: () => null,
      },
    })
  }
}
