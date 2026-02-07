import * as courseService from "../services/course.service.js";

export const getPopularCourses = async (req, res) => {
    try {
        const courses = await courseService.getPopularCourses();
        res.status(200).json(courses);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

export const createCourse = async (req, res) => {
    try{
        const course = await courseService.createCourse(req.body);
        res.status(201).json(course);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

export const getCourseById = async (req, res) => {
    try{
        const course = await courseService.getCourseById(req.params.courseId);
        res.status(200).json(course);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

export const updateCourse = async (req, res) => {
    try{
        const course = await courseService.updateCourse(req.params.courseId, req.body);
        res.status(200).json(course);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

export const deleteCourse = async (req, res) => {
    try{
        const course = await courseService.deleteCourse(req.params.courseId);
        res.status(200).json(course);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

export const getCourseBySlug = async (req, res) => {
    try{
        const course = await courseService.getCourseBySlug(req.params.slug);
        res.status(200).json(course);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

export const getAllCourses = async (req, res) => {
    try{
        const courses = await courseService.getAllCourses();
        res.status(200).json(courses);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}