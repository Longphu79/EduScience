export class HttpError extends Error {
  constructor(message = "Error", statusCode = 500, meta = undefined) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.meta = meta;
  }
}

export function badRequest(message = "Bad request", meta) {
  return new HttpError(message, 400, meta);
}

export function unauthorized(message = "Unauthorized", meta) {
  return new HttpError(message, 401, meta);
}

export function forbidden(message = "Forbidden", meta) {
  return new HttpError(message, 403, meta);
}

export function notFound(message = "Not found", meta) {
  return new HttpError(message, 404, meta);
}