import * as cartService from "../services/cart.service.js";

export const getMyCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await cartService.getCart(userId);

    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }

    const cart = await cartService.addCourseToCart(userId, courseId);

    res.status(200).json({
      message: "Added to cart successfully",
      cart,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


export const updateCartQuantity = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { courseId, quantity } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "quantity must be at least 1" });
    }

    const cart = await cartService.updateCourseQuantity(userId, courseId, quantity);

    res.status(200).json({
      message: "Quantity updated successfully",
      cart,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const removeCourseFromCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }

    const cart = await cartService.removeCourseFromCart(userId, courseId);

    res.status(200).json({
      message: "Removed from cart successfully",
      cart,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}