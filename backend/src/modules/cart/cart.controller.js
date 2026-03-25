import * as cartService from "./cart.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

function getUserIdFromRequest(req) {
  return (
    req.user?._id ||
    req.user?.userId ||
    req.user?.id ||
    req.user?.sub ||
    null
  );
}

function getUserRoleFromRequest(req) {
  return req.user?.role || null;
}

function ensureCartAccess(req, res) {
  const userId = getUserIdFromRequest(req);
  const role = getUserRoleFromRequest(req);

  if (!userId) {
    sendError(res, {
      statusCode: 401,
      message: "Unauthorized",
    });
    return null;
  }

  if (!["student", "admin"].includes(role)) {
    sendError(res, {
      statusCode: 403,
      message: "Only student or admin can use cart",
    });
    return null;
  }

  return { userId, role };
}

function getCartErrorStatus(err) {
  if (!err?.message) return 400;

  if (err.message === "Unauthorized") return 401;
  if (err.message.includes("not allowed")) return 403;
  if (err.message.includes("not found")) return 404;

  return 400;
}

export const getMyCart = async (req, res) => {
  try {
    const access = ensureCartAccess(req, res);
    if (!access) return;

    const cart = await cartService.getCart(access.userId);

    return sendSuccess(res, {
      message: "Cart fetched successfully",
      data: cart,
    });
  } catch (err) {
    console.error("getMyCart error:", err);

    return sendError(res, {
      statusCode: getCartErrorStatus(err),
      message: err.message || "Failed to fetch cart",
    });
  }
};

export const addToCart = async (req, res) => {
  try {
    const access = ensureCartAccess(req, res);
    if (!access) return;

    const { courseId, quantity } = req.body;

    if (!courseId || typeof courseId !== "string") {
      return sendError(res, {
        statusCode: 400,
        message: "courseId is required",
      });
    }

    const cart = await cartService.addCourseToCart(
      access.userId,
      courseId,
      quantity
    );

    return sendSuccess(res, {
      message: "Added to cart successfully",
      data: cart,
    });
  } catch (err) {
    console.error("addToCart error:", err);

    return sendError(res, {
      statusCode: getCartErrorStatus(err),
      message: err.message || "Failed to add to cart",
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const access = ensureCartAccess(req, res);
    if (!access) return;

    const { courseId } = req.params;

    if (!courseId || typeof courseId !== "string") {
      return sendError(res, {
        statusCode: 400,
        message: "courseId is required",
      });
    }

    const cart = await cartService.removeCourseFromCart(access.userId, courseId);

    return sendSuccess(res, {
      message: "Removed item from cart successfully",
      data: cart,
    });
  } catch (err) {
    console.error("removeFromCart error:", err);

    return sendError(res, {
      statusCode: getCartErrorStatus(err),
      message: err.message || "Failed to remove item from cart",
    });
  }
};

export const updateItemQuantity = async (req, res) => {
  try {
    const access = ensureCartAccess(req, res);
    if (!access) return;

    const { courseId, quantity } = req.body;

    if (!courseId || typeof courseId !== "string") {
      return sendError(res, {
        statusCode: 400,
        message: "courseId is required",
      });
    }

    const cart = await cartService.updateCartItemQuantity(
      access.userId,
      courseId,
      quantity
    );

    return sendSuccess(res, {
      message: "Cart item quantity updated successfully",
      data: cart,
    });
  } catch (err) {
    console.error("updateItemQuantity error:", err);

    return sendError(res, {
      statusCode: getCartErrorStatus(err),
      message: err.message || "Failed to update cart quantity",
    });
  }
};

export const clearMyCart = async (req, res) => {
  try {
    const access = ensureCartAccess(req, res);
    if (!access) return;

    const cart = await cartService.clearCart(access.userId);

    return sendSuccess(res, {
      message: "Cart cleared successfully",
      data: cart,
    });
  } catch (err) {
    console.error("clearMyCart error:", err);

    return sendError(res, {
      statusCode: getCartErrorStatus(err),
      message: err.message || "Failed to clear cart",
    });
  }
};

export const checkoutMyCart = async (req, res) => {
  try {
    const access = ensureCartAccess(req, res);
    if (!access) return;

    const result = await cartService.checkoutCart(access.userId);

    return sendSuccess(res, {
      message: "Checkout completed successfully",
      data: result,
    });
  } catch (err) {
    console.error("checkoutMyCart error:", err);

    return sendError(res, {
      statusCode: getCartErrorStatus(err),
      message: err.message || "Failed to checkout cart",
    });
  }
};