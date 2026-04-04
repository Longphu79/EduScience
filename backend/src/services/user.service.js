import User from "../models/User.js";
import bcrypt from "bcryptjs";
import Student from "../models/Student.js";
import Instructor from "../models/Instructor.js";
import mongoose from "mongoose";
import { createHttpError } from "../utils/httpError.js";

export const getUserById = async (userId) => {
    return await User.findById(userId);
}

// Get user profile with role-specific data
export const getProfile = async (userId) => {
    const user = await User.findById(userId).lean();
    if (!user) {
        throw createHttpError(404, "User not found");
    }

    let profileData = null;
    if (user.role === "student") {
        profileData = await Student.findOne({userId}).lean();
    }

    if (user.role === "instructor") {
        profileData = await Instructor.findOne({userId}).lean();
    }

    return { ...user, profileData };
}

// Update user profile
export const updateProfile = async (userId, data) => {
    const allowedFields = ["email", "avatarUrl"];
    const updateData = {};

    allowedFields.forEach((field) => {
        if (data[field] !== undefined) {
            updateData[field] = data[field];
        }
    });

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!user) {
        throw createHttpError(404, "User not found");
    }

    return user;
}

// Change user password
export const changePassword = async (userId, oldPassword, newPassword) => {
    const user = await User.findById(userId).select("+password");
    if (!user) {
        throw createHttpError(404, "User not found");
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
        throw createHttpError(400, "Old password is incorrect");
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return true;
}

// deactive account
export const deactivateAccount = async(userId) =>{
    const user = await User.findByIdAndUpdate(userId,{isActive: false}, {new: true});
    if (!user) {
        throw createHttpError(404, "User not found");
    }

    return user;
}

// Student profile
export const updateStudentProfile = async(userId, data) =>{
    const allowedFields = ["fullName", "dateOfBirth", "address", "phone"];
    const updateData = {};

    allowedFields.forEach((field) => {
        if (data[field] !== undefined) {
            updateData[field] = data[field];
        }
    });

    const student = await Student.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(userId) },
        { $set: updateData },
        { new: true }
    );
    return student;
}

// instructor profile
export const updateInstructorProfile = async(userId, data) => {
    const allowedFields = ["name", "bio", "expertise"];
    const updateData = {};

    allowedFields.forEach((field) => {
        if (data[field] !== undefined) {
            updateData[field] = data[field];
        }
    });

    const instructor = await Instructor.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(userId) },
        { $set: updateData },
        { new: true }
    );
    return instructor;

}

export const listInstructorOptions = async () => {
    const instructors = await Instructor.find()
        .select("name userId")
        .populate({
            path: "userId",
            select: "username email",
        })
        .sort({ name: 1 })
        .lean();

    return instructors.map((instructor) => ({
        _id: instructor._id,
        name: instructor.name,
        userId: instructor.userId?._id ?? instructor.userId ?? null,
        username: instructor.userId?.username ?? "",
        email: instructor.userId?.email ?? "",
    }));
}




