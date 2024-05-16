export default class ResponseError extends Error {
  statusCode: number;
  constructor(msg: string, statusCode: number) {
    super(msg);
    this.statusCode = statusCode;
  }
}

export class NotFound extends ResponseError {
  constructor() {
    super("Not found", 404);
  }
}

export class Forbidden extends ResponseError {
  constructor(message?: string) {
    super(message || "Unauthorized access", 403);
  }
}
