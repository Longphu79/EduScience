import Course from "../models/Course.js";

export const getPopularCourses = async () => {
    const courses = await Course.find().sort({ isPopular: true}).limit(6).populate('Instructor');
    return courses;
}

