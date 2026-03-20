import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "eduscience_secret_key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export const signToken = (payload = {}) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyAccessToken = (token) => {
  const decoded = jwt.verify(token, JWT_SECRET);

  const normalizedUserId =
    decoded?.userId || decoded?._id || decoded?.id || decoded?.sub || null;

  return {
    ...decoded,
    _id: normalizedUserId,
    userId: normalizedUserId,
    id: normalizedUserId,
    role: decoded?.role || null,
  };
};