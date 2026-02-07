import Course from "../models/Course.js";

export const getPopularCourses = async () => {
    const courses = await Course
        .find({isPopular: true})
        .sort({ totalEnrollments: -1 })
        .limit(6)
        .populate('instructorId')

    return courses;
};

export const createCourse = async(courseData) => {
    return await Course.create(courseData); 
}

export const getCourseById = async(courseId) => {
    return await Course.findById(courseId)
           .populate('instructorId')
           .sort({ createdAt: -1 });
}

export const getCourseBySlug = async(slug) => {
    return await Course.findOne({slug, status: 'published'});
}

export const getAllCourses = async(filter = {}) => {
    return await Course.find(filter)
              .populate('instructorId')
              .sort({ createdAt: -1 });
}

export const updateCourse = async(courseId, updateData) => {
    return await Course.findByIdAndUpdate(courseId, updateData, {new: true});
}

export const deleteCourse = async(courseId) => {
    return await Course.findByIdAndDelete(courseId);
}




