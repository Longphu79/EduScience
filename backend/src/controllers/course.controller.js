import * as courseService from "../services/course.service.js";

export const getPopularCourses = async (req, res) => {
    try {
        const courses = await courseService.getPopularCourses(req.actor);
        res.status(200).json(courses);
    } catch (err) {
        res.status(err.statusCode || 400).json({ message: err.message });
    }
}

export const createCourse = async (req, res) => {
    try{
        const course = await courseService.createCourse(req.body, req.actor);
        res.status(201).json(course);
    } catch (err) {
        res.status(err.statusCode || 400).json({ message: err.message });
    }
}

export const getCourseById = async (req, res) => {
    try{
        const course = await courseService.getCourseById(req.params.courseId, req.actor);
        res.status(200).json(course);
    } catch (err) {
        res.status(err.statusCode || 400).json({ message: err.message });
    }
}

export const updateCourse = async (req, res) => {
    try{
        const course = await courseService.updateCourse(req.params.courseId, req.body, req.actor);
        res.status(200).json(course);
    } catch (err) {
        res.status(err.statusCode || 400).json({ message: err.message });
    }
}

export const deleteCourse = async (req, res) => {
    try{
        const course = await courseService.deleteCourse(req.params.courseId, req.actor);
        res.status(200).json(course);
    } catch (err) {
        res.status(err.statusCode || 400).json({ message: err.message });
    }
}

export const getCourseBySlug = async (req, res) => {
    try{
        const course = await courseService.getCourseBySlug(
            req.params.slug,
            req.actor,
        );
        res.status(200).json(course);
    } catch (err) {
        res.status(err.statusCode || 400).json({ message: err.message });
    }
}

export const getAllCourses = async (req, res) => {
    try{
        const courses = await courseService.getAllCourses(req.query, req.actor);
        res.status(200).json(courses);
    } catch (err) {
        res.status(err.statusCode || 400).json({ message: err.message });
    }
}
