import * as userService from '../services/user.service.js';

export const getProfile = async(req, res) =>{
    try{
        const user = await userService.getProfile(req.params.userId);
        res.status(200).json(user);
    }catch(err){
         res.status(400).json({ message: err.message });
    }
}

export const updateProfile = async(req, res) =>{
    try{
        const user = await userService.updateProfile(req.params.userId ,req.body);
        res.status(200).json(user);
    }catch(err){
         res.status(400).json({ message: err.message });
    }
}

export const deactivateAccount = async(req, res) =>{
    try{
        const user = await userService.deactivateAccount(req.params.userId);
        res.status(200).json(user);
    }catch(err){
         res.status(400).json({ message: err.message });
    }
}

export const updateStudentProfile = async(req, res) =>{
    try{
        const user = await userService.updateStudentProfile(req.params.userId ,req.body);
        if (!user) {
       return res.status(404).json({ message: "Student profile not found" });
    }
        res.status(200).json(user);
    }catch(err){
         res.status(400).json({ message: err.message });
    }
}

export const updateInstructorProfile = async(req, res) =>{
    try{
        const user = await userService.updateInstructorProfile(req.params.userId ,req.body);
        if (!user) {
       return res.status(404).json({ message: "Instructor profile not found" });
    }

        res.status(200).json(user);
    }catch(err){
         res.status(400).json({ message: err.message });
    }
}

export const changePassword = async(req, res) =>{
    try{
        const { oldPassword, newPassword } = req.body;
        const user = await userService.changePassword(req.params.userId ,oldPassword, newPassword);
        res.status(200).json(user);
    }catch(err){
         res.status(400).json({ message: err.message });
    }
}
