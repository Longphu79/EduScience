import {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
    clearWishlist,
} from '../controllers/wishlist.controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import express from 'express';

const router = express.Router();
router.use(authMiddleware); // Apply authentication middleware to all routes in this router

router.post('/:courseId', authMiddleware, addToWishlist);
router.get('/get', authMiddleware, getWishlist);
router.put('/:courseId', authMiddleware, removeFromWishlist);
router.put('/', authMiddleware, clearWishlist);

export default router;