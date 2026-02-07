import User from "../models/user.js";
import bcrypt from "bcryptjs";
import Student from "../models/Student.js";
import Instructor from "../models/Instructor.js";


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
        profileData = await Student.findOne({userId});
    }

    if (user.role === "instructor") {
        profileData = await Instructor.findOne({userId});
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
    return true;
}

// deactive account
export const deactivateAccount = async(userId) =>{
    return await User.findByIdAndUpdate(userId,{isActive: false}, {new: true});
}

// Student profile
export const updateStudentProfile = async(userId, data) =>{
    return await Student.findOneAndUpdate({userId}, data, {new: true});
}

// instructor profile
export const updateInstructorProfile = async(userId, data) => {
    return await Instructor.findOneAndUpdate({userId}, data, {new: true});
}







