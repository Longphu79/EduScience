import * as courseService from "../services/course.service.js";

export const getPopularCourses = async (req, res) => {
    try {
        const courses = await courseService.getPopularCourses();
        res.status(200).json(courses);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}