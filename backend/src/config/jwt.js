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

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || typeof authHeader !== "string") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: token missing",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: invalid token format",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token || typeof token !== "string") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: invalid token",
      });
    }

    req.user = verifyAccessToken(token);
    next();
  } catch (error) {
    console.error("verifyToken error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Unauthorized: token invalid or expired",
    });
  }
};