import * as cartService from "./cart.service.js";

export const getMyCart = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const cart = await cartService.getCart(userId);
    res.status(200).json(cart);
  } catch (err) {
    console.error("getMyCart error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?._id;
    const { courseId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }

    const cart = await cartService.addCourseToCart(userId, courseId);

    res.status(200).json({
      message: "Added to cart successfully",
      cart,
    });
  } catch (err) {
    console.error("addToCart error:", err);
    res.status(400).json({ message: err.message });
  }
};