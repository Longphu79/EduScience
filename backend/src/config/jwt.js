import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

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