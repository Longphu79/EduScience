import { sendError } from "../utils/response.js";

export function errorMiddleware(err, req, res, next) {
  console.error("errorMiddleware:", err);

  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal server error";
  let meta = err.meta;

  if (err.name === "ValidationError") {
    statusCode = 400;
    meta = Object.values(err.errors || {}).map((item) => item.message);
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    message = `${field} already exists`;
  }

  if (err.name === "MulterError") {
    statusCode = 400;

    if (err.code === "LIMIT_FILE_SIZE") {
      message = "File size exceeds the allowed limit";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      message = "Unexpected file field";
    } else {
      message = err.message || "Upload failed";
    }
  }

  return sendError(res, {
    statusCode,
    message,
    data: null,
    meta,
  });
}