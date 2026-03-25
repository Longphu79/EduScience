export function sendSuccess(
  res,
  {
    statusCode = 200,
    message = "Success",
    data = null,
    meta = undefined,
  } = {}
) {
  const payload = {
    success: true,
    message,
    data,
  };

  if (meta !== undefined) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
}

export function sendError(
  res,
  {
    statusCode = 500,
    message = "Internal server error",
    data = null,
    meta = undefined,
  } = {}
) {
  const payload = {
    success: false,
    message,
    data,
  };

  if (meta !== undefined) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
}