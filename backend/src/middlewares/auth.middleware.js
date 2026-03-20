import { verifyAccessToken } from "../config/jwt.js";
import User from "../modules/user/user.model.js";
import { sendError } from "../utils/response.js";

function getBearerToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || typeof authHeader !== "string") {
    return null;
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

export const verifyToken = async (req, res, next) => {
  try {
    const token = getBearerToken(req);

    if (!token) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized: token missing or invalid format",
      });
    }

    const decoded = verifyAccessToken(token);

    const userId = decoded?._id || decoded?.userId || decoded?.id || null;

    if (!userId) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized: invalid token payload",
      });
    }

    const user = await User.findById(userId).select("_id role isActive");

    if (!user) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized: user not found",
      });
    }

    if (!user.isActive) {
      return sendError(res, {
        statusCode: 401,
        message: "Your account has been deactivated",
      });
    }

    req.user = {
      _id: user._id,
      id: user._id,
      userId: user._id,
      role: user.role,
      isActive: user.isActive,
    };

    return next();
  } catch (error) {
    console.error("verifyToken error:", error.message);

    return sendError(res, {
      statusCode: 401,
      message: "Unauthorized: token invalid or expired",
    });
  }
};

export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return sendError(res, {
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  return next();
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, {
        statusCode: 403,
        message: "Forbidden",
      });
    }

    return next();
  };
};

export const requireAdmin = requireRole("admin");
export const requireInstructor = requireRole("instructor", "admin");
export const requireStudent = requireRole("student", "admin");