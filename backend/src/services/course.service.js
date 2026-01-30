import Course from "../models/Course.js";

export const getPopularCourses = async () => {
    const courses = await Course
        .find({isPopular: true})
        .sort({ totalEnrollments: -1 })
        .limit(6)
        .populate('instructorId')

    return courses;
};

