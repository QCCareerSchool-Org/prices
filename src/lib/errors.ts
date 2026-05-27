abstract class ApplicationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ClientError extends ApplicationError {
  public constructor(message: string) {
    super(message);
  }
}

export class ServerError extends ApplicationError {
  public constructor(message: string) {
    super(message);
  }
}
