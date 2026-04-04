import Course from "../models/Course.js";
import Instructor from "../models/Instructor.js";
import Lesson from "../models/Lesson.js";
import {
    canManageCourse,
    assertCourseOwnership,
    getEnrollmentMapForActor,
    getInstructorProfileForActor,
} from "./access.service.js";
import {
    publicCourseSelect,
    publicInstructorPopulate,
} from "./course.public.js";
import { createHttpError } from "../utils/httpError.js";

const COURSE_LEVELS = ["beginner", "intermediate", "advanced"];
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 24;

const buildViewerEnrollment = (enrollment) => ({
    isEnrolled: Boolean(enrollment),
    progress: enrollment?.progress ?? 0,
    completed: Boolean(enrollment?.completed),
});

const attachViewerEnrollment = async (courses, actor) => {
    const items = Array.isArray(courses) ? courses : [courses];
    const courseIds = items
        .map((course) => course?._id)
        .filter(Boolean);
    const enrollmentMap = await getEnrollmentMapForActor(courseIds, actor);

    return items.map((course) => {
        const plainCourse =
            typeof course?.toObject === "function"
                ? course.toObject()
                : { ...course };

        plainCourse.viewerEnrollment = buildViewerEnrollment(
            enrollmentMap.get(plainCourse._id.toString()),
        );

        return plainCourse;
    });
};

const pickCourseData = (courseData = {}) => {
    const allowedFields = [
        "title",
        "slug",
        "shortDescription",
        "description",
        "category",
        "thumbnail",
        "previewVideo",
        "level",
        "language",
        "duration",
        "price",
        "salePrice",
        "isFree",
        "isPopular",
        "status",
    ];

    return allowedFields.reduce((acc, field) => {
        if (courseData[field] !== undefined) {
            acc[field] = courseData[field];
        }

        return acc;
    }, {});
};

const normalizePage = (value) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PAGE;
};

const normalizeLimit = (value) => {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return DEFAULT_LIMIT;
    }

    return Math.min(parsed, MAX_LIMIT);
};

const buildSort = (sortBy) => {
    switch (sortBy) {
        case "rating":
            return { rating: -1, totalReviews: -1, createdAt: -1 };
        case "priceAsc":
            return { price: 1, createdAt: -1 };
        case "priceDesc":
            return { price: -1, createdAt: -1 };
        case "newest":
            return { createdAt: -1 };
        case "popular":
        default:
            return { totalEnrollments: -1, rating: -1, createdAt: -1 };
    }
};

const buildPublicCourseFilter = async (query = {}) => {
    const filter = { status: "published" };
    const keyword = query.q?.trim();

    if (query.category && query.category !== "All") {
        filter.category = query.category;
    }

    if (query.level && query.level !== "All") {
        filter.level = query.level.toLowerCase();
    }

    if (!keyword) {
        return filter;
    }

    const regex = new RegExp(keyword, "i");
    const matchingInstructors = await Instructor.find({ name: regex }).select(
        "_id",
    );

    filter.$or = [
        { title: regex },
        { shortDescription: regex },
        { description: regex },
        { category: regex },
        { slug: regex },
    ];

    if (matchingInstructors.length > 0) {
        filter.$or.push({
            instructorId: {
                $in: matchingInstructors.map((instructor) => instructor._id),
            },
        });
    }

    return filter;
};

export const getPopularCourses = async (actor) => {
    const courses = await Course
        .find({isPopular: true, status: "published"})
        .select(publicCourseSelect)
        .sort({ totalEnrollments: -1 })
        .limit(6)
        .populate(publicInstructorPopulate);

    return await attachViewerEnrollment(courses, actor);
};

export const createCourse = async(courseData, actor) => {
    const instructor = await getInstructorProfileForActor(
        actor,
        courseData?.instructorId,
    );

    return await Course.create({
        ...pickCourseData(courseData),
        instructorId: instructor._id,
    });
}

export const getCourseById = async(courseId, actor) => {
    const course = await Course.findById(courseId)
           .populate(publicInstructorPopulate);

    if (!course) {
        throw createHttpError(404, "Course not found");
    }

    if (course.status === "published" || await canManageCourse(course, actor)) {
        return course;
    }

    throw createHttpError(404, "Course not found");
}

export const getCourseBySlug = async(slug, actor) => {
    const course = await Course.findOne({slug, status: 'published'})
        .select(publicCourseSelect)
        .populate(publicInstructorPopulate)
        .lean();

    if (!course) {
        throw createHttpError(404, "Course not found");
    }

    const lessons = await Lesson.find({
        courseId: course._id,
        isPublished: true,
    })
        .select(
            "title description duration estimatedCompletionMinutes order isPreview objectives resources",
        )
        .sort({ order: 1 })
        .lean();

    const [courseWithViewerEnrollment] = await attachViewerEnrollment(
        [course],
        actor,
    );

    return { ...courseWithViewerEnrollment, lessons };
}

export const getAllCourses = async(query = {}, actor) => {
    const page = normalizePage(query.page);
    const limit = normalizeLimit(query.limit);
    const filter = await buildPublicCourseFilter(query);
    const [items, total, categories] = await Promise.all([
        Course.find(filter)
            .select(publicCourseSelect)
            .populate(publicInstructorPopulate)
            .sort(buildSort(query.sort))
            .skip((page - 1) * limit)
            .limit(limit),
        Course.countDocuments(filter),
        Course.distinct("category", { status: "published" }),
    ]);
    const itemsWithViewerEnrollment = await attachViewerEnrollment(items, actor);

    return {
        items: itemsWithViewerEnrollment,
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        categories: categories.filter(Boolean).sort((a, b) =>
            a.localeCompare(b),
        ),
        levels: COURSE_LEVELS,
    };
}

export const updateCourse = async(courseId, updateData, actor) => {
    await assertCourseOwnership(courseId, actor);

    const courseUpdate = pickCourseData(updateData);

    if (actor?.role === "admin" && updateData?.instructorId) {
        const instructor = await getInstructorProfileForActor(
            actor,
            updateData.instructorId,
        );
        courseUpdate.instructorId = instructor._id;
    }

    return await Course.findByIdAndUpdate(
        courseId,
        courseUpdate,
        {new: true},
    ).populate(publicInstructorPopulate);
}

export const deleteCourse = async(courseId, actor) => {
    await assertCourseOwnership(courseId, actor);

    return await Course.findByIdAndDelete(courseId);
}
