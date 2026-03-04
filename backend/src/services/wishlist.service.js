import wishlist from '../models/Wishlist.js';
import mongoose from 'mongoose';

export const addToWishlist = async (userId, courseId) => {
    return await wishlist.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(userId) },
        { $addToSet: { courseIds: courseId } },
        { new: true, upsert: true }
    );
}

export const removeFromWishlist = async (userId, courseId) => {
    return await wishlist.findOneAndUpdate(
        {  userId: new mongoose.Types.ObjectId(userId) },
        { $pull: { courseIds: courseId } },
        { new: true }
    )
}

export const getWishlist = async (userId) => {
    return await wishlist.findOne({  userId: new mongoose.Types.ObjectId(userId) }).populate('courseIds');
}

export const clearWishlist = async (userId) => {
    return await wishlist.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(userId) },
        { $set: { courseIds: [] } },
        { new: true }
    )
}