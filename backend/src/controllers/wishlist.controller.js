import * as wishlistService from '../services/wishlist.service.js';

export const addToWishlist = async (req, res) => {
    try {
        const wishlist = await wishlistService.addToWishlist(req.user.userId, req.params.courseId);
        res.status(200).json(wishlist);
    }catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const removeFromWishlist = async (req, res) => {
    try {
        const wishlist = await wishlistService.removeFromWishlist(req.user.userId, req.params.courseId);
        res.status(200).json(wishlist);
    }catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getWishlist = async (req, res) => {
    try {
        const wishlist = await wishlistService.getWishlist(req.user.userId);
        res.status(200).json(wishlist);
    }catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const clearWishlist = async (req, res) => {
    try {
        const wishlist = await wishlistService.clearWishlist(req.user.userId);
        res.status(200).json(wishlist);
    }catch (error) {
        res.status(500).json({ message: error.message });
    }
}