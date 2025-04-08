export class HandleError extends Error {
  declare private payload: any;
  constructor(message: string, payload?: any, error?: unknown) {
    super(message, { cause: error });
    this.payload = payload;
  }
}
