import { verifyToken } from "../config/jwt.js";

const attachActor = (req, decoded) => {
    req.user = decoded;
    req.actor = {
        userId: decoded.userId,
        role: decoded.role,
    };
};

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = verifyToken(token);
        attachActor(req, decoded);
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

export const optionalAuthMiddleware = (req, _res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next();
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = verifyToken(token);
        attachActor(req, decoded);
    } catch (_error) {
        // Ignore invalid tokens on public routes.
    }

    next();
};

export const requireRoles = (...allowedRoles) => (req, res, next) => {
    if (!req.actor?.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.actor.role)) {
        return res.status(403).json({ message: "Forbidden" });
    }

    next();
};
