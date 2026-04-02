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

function normalizeRole(roleValue) {
  const raw =
    roleValue?.name ||
    roleValue?.code ||
    roleValue?.role ||
    roleValue ||
    "";

  const normalized = String(raw).trim().toLowerCase();

  if (normalized === "administrator") return "admin";
  return normalized;
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

    console.log("[AUTH] decoded token:", decoded);

    if (!userId) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized: invalid token payload",
      });
    }

    const user = await User.findById(userId).select("_id email role isActive");

    console.log("[AUTH] db user:", user);

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

    const normalizedRole = normalizeRole(user.role);

    req.user = {
      _id: user._id,
      id: user._id,
      userId: user._id,
      email: user.email,
      role: normalizedRole,
      rawRole: user.role,
      isActive: user.isActive,
    };

    console.log("[AUTH] req.user after normalize:", req.user);

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
  const allowedRoles = roles.map((role) => normalizeRole(role));

  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const currentRole = normalizeRole(req.user.role);

    console.log("[AUTH] role check:", {
      currentRole,
      rawRole: req.user.rawRole,
      allowedRoles,
      email: req.user.email,
      userId: String(req.user.userId || ""),
      path: req.originalUrl,
    });

    if (!allowedRoles.includes(currentRole)) {
      return sendError(res, {
        statusCode: 403,
        message:
          process.env.NODE_ENV === "development"
            ? `Forbidden: currentRole=${currentRole}, rawRole=${req.user.rawRole}`
            : "Forbidden",
      });
    }

    return next();
  };
};

export const requireAdmin = requireRole("admin");
export const requireInstructor = requireRole("instructor", "admin");
export const requireStudent = requireRole("student", "admin");