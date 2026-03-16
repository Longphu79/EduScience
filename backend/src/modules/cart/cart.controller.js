import * as cartService from "./cart.service.js";

function getUserIdFromRequest(req) {
  return (
    req.user?.userId ||
    req.user?._id ||
    req.user?.id ||
    req.user?.sub ||
    null
  );
}

export const getMyCart = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const cart = await cartService.getCart(userId);

    return res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      data: cart,
    });
  } catch (err) {
    console.error("getMyCart error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch cart",
    });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const { courseId, quantity } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "courseId is required",
      });
    }

    const cart = await cartService.addCourseToCart(userId, courseId, quantity);

    return res.status(200).json({
      success: true,
      message: "Added to cart successfully",
      data: cart,
    });
  } catch (err) {
    console.error("addToCart error:", err);
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to add to cart",
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const { courseId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "courseId is required",
      });
    }

    const cart = await cartService.removeCourseFromCart(userId, courseId);

    return res.status(200).json({
      success: true,
      message: "Removed item from cart successfully",
      data: cart,
    });
  } catch (err) {
    console.error("removeFromCart error:", err);
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to remove item from cart",
    });
  }
};

export const updateItemQuantity = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const { courseId, quantity } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "courseId is required",
      });
    }

    const cart = await cartService.updateCartItemQuantity(
      userId,
      courseId,
      quantity
    );

    return res.status(200).json({
      success: true,
      message: "Cart item quantity updated successfully",
      data: cart,
    });
  } catch (err) {
    console.error("updateItemQuantity error:", err);
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to update cart quantity",
    });
  }
};

export const clearMyCart = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const cart = await cartService.clearCart(userId);

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: cart,
    });
  } catch (err) {
    console.error("clearMyCart error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to clear cart",
    });
  }
};

export const checkoutMyCart = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await cartService.checkoutCart(userId);

    return res.status(200).json({
      success: true,
      message: "Checkout completed successfully",
      data: result,
    });
  } catch (err) {
    console.error("checkoutMyCart error:", err);
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to checkout cart",
    });
  }
};