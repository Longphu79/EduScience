import { sendError } from "../utils/response.js";

export function notFoundMiddleware(req, res, next) {
  return sendError(res, {
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    data: null,
  });
}