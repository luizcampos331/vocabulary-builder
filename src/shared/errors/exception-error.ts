export class ExceptionError extends Error {
  constructor(message: string, error?: unknown) {
    super(`Internal server error: ${message}`, {
      cause: error,
    });
  }
}
