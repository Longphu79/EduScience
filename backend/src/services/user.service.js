import User from "../models/user.js";
import bcrypt from "bcryptjs";
import Student from "../models/Student.js";
import Instructor from "../models/Instructor.js";
import mongoose from "mongoose";

export const getUserById = async (userId) => {
    return await User.findById(userId);
}

// Get user profile with role-specific data
export const getProfile = async (userId) => {
    const user = await User.findById(userId).lean();
    if (!user) {
        throw new Error("User not found");
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
    return user;
}

// Change user password
export const changePassword = async (userId, oldPassword, newPassword) => {
    const user = await User.findById(userId).select("+password");
    if (!user) {
        throw new Error("User not found");
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
        throw new Error("Old password is incorrect");
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    console.log("Password changed for user:", userId);
    console.log("Old Password:", oldPassword);
    console.log("New Password:", newPassword);
    return true;
}

// deactive account
export const deactivateAccount = async(userId) =>{
    return await User.findByIdAndUpdate(userId,{isActive: false}, {new: true});
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
    console.log("userId:", userId);
    console.log("updateData:", updateData);
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
    console.log("userId:", userId);
    console.log("updateData:", updateData);
    return instructor;

}







