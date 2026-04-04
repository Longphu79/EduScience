export const createHttpError = (statusCode, message) =>
  Object.assign(new Error(message), { statusCode });
