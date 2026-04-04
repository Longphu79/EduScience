import * as userService from '../services/user.service.js';

export const getProfile = async(req, res) =>{
    try{
        const user = await userService.getProfile(req.actor.userId);
        res.status(200).json(user);
    }catch(err){
         res.status(err.statusCode || 400).json({ message: err.message });
    }
}

export const updateProfile = async(req, res) =>{
    try{
        const user = await userService.updateProfile(req.actor.userId ,req.body);
        res.status(200).json(user);
    }catch(err){
         res.status(err.statusCode || 400).json({ message: err.message });
    }
}

export const deactivateAccount = async(req, res) =>{
    try{
        const user = await userService.deactivateAccount(req.actor.userId);
        res.status(200).json(user);
    }catch(err){
         res.status(err.statusCode || 400).json({ message: err.message });
    }
}

export const updateStudentProfile = async(req, res) =>{
    try{
        const user = await userService.updateStudentProfile(req.actor.userId ,req.body);
        if (!user) {
       return res.status(404).json({ message: "Student profile not found" });
    }
        res.status(200).json(user);
    }catch(err){
         res.status(err.statusCode || 400).json({ message: err.message });
    }
}

export const updateInstructorProfile = async(req, res) =>{
    try{
        const user = await userService.updateInstructorProfile(req.actor.userId ,req.body);
        if (!user) {
       return res.status(404).json({ message: "Instructor profile not found" });
    }

        res.status(200).json(user);
    }catch(err){
         res.status(err.statusCode || 400).json({ message: err.message });
    }
}

export const changePassword = async(req, res) =>{
    try{
        const { oldPassword, newPassword } = req.body;
        const user = await userService.changePassword(req.actor.userId ,oldPassword, newPassword);
        res.status(200).json(user);
    }catch(err){
         res.status(err.statusCode || 400).json({ message: err.message });
    }
}

export const listInstructorOptions = async(req, res) =>{
    try{
        const instructors = await userService.listInstructorOptions();
        res.status(200).json(instructors);
    }catch(err){
         res.status(err.statusCode || 400).json({ message: err.message });
    }
}
