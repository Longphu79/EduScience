import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDatabase } from "../config/Database.js";

import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import Material from "../models/Material.js";
import Assignment from "../models/Assignment.js";
import Quiz from "../models/Quiz.js";
import Enrollment from "../models/Enrollment.js";

dotenv.config();

const DEFAULT_INSTRUCTOR_ID = new mongoose.Types.ObjectId(
  "697772345805dde1c5f090cb"
);

const DEFAULT_SECTION_ID = new mongoose.Types.ObjectId(
  "699999999999999999999999"
);

function toObjectId(value) {
  if (!value) return null;
  if (value instanceof mongoose.Types.ObjectId) return value;

  try {
    return new mongoose.Types.ObjectId(String(value));
  } catch {
    return null;
  }
}

function toObjectIdArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => toObjectId(item)).filter(Boolean);
}

async function fixCourses() {
  const courses = await Course.find({}, { _id: 1, instructorId: 1 }).lean();

  for (const course of courses) {
    await Course.collection.updateOne(
      { _id: course._id },
      {
        $set: {
          instructorId: toObjectId(course.instructorId) || DEFAULT_INSTRUCTOR_ID,
        },
      }
    );
  }

  console.log(`✅ Fixed ${courses.length} course(s)`);
}

async function fixLessons() {
  const lessons = await Lesson.collection.find({}).toArray();

  for (const lesson of lessons) {
    const updateData = {};

    const fixedCourseId = toObjectId(lesson.courseId);
    const fixedSectionId = toObjectId(lesson.sectionId) || DEFAULT_SECTION_ID;

    if (fixedCourseId) {
      updateData.courseId = fixedCourseId;
    }

    updateData.sectionId = fixedSectionId;

    if (lesson.order === undefined || lesson.order === null) {
      updateData.order = 1;
    }

    if (!lesson.videoUrl) {
      updateData.videoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    }

    if (!lesson.title) {
      updateData.title = "Untitled Lesson";
    }

    if (lesson.description === undefined) {
      updateData.description = "";
    }

    if (lesson.duration === undefined || lesson.duration === null) {
      updateData.duration = 0;
    }

    if (lesson.isPreview === undefined) {
      updateData.isPreview = false;
    }

    if (lesson.isPublished === undefined) {
      updateData.isPublished = true;
    }

    if (Object.keys(updateData).length > 0) {
      await Lesson.collection.updateOne(
        { _id: lesson._id },
        { $set: updateData }
      );
    }
  }

  console.log(`✅ Fixed ${lessons.length} lesson(s)`);
}

async function fixMaterials() {
  const materials = await Material.collection.find({}).toArray();

  for (const item of materials) {
    const updateData = {
      instructorId: toObjectId(item.instructorId) || DEFAULT_INSTRUCTOR_ID,
      lessonId: item.lessonId ? toObjectId(item.lessonId) : null,
    };

    const fixedCourseId = toObjectId(item.courseId);
    if (fixedCourseId) {
      updateData.courseId = fixedCourseId;
    }

    await Material.collection.updateOne(
      { _id: item._id },
      { $set: updateData }
    );
  }

  console.log(`✅ Fixed ${materials.length} material(s)`);
}

async function fixAssignments() {
  const assignments = await Assignment.collection.find({}).toArray();

  for (const item of assignments) {
    const updateData = {
      instructorId: toObjectId(item.instructorId) || DEFAULT_INSTRUCTOR_ID,
      lessonId: item.lessonId ? toObjectId(item.lessonId) : null,
    };

    const fixedCourseId = toObjectId(item.courseId);
    if (fixedCourseId) {
      updateData.courseId = fixedCourseId;
    }

    await Assignment.collection.updateOne(
      { _id: item._id },
      { $set: updateData }
    );
  }

  console.log(`✅ Fixed ${assignments.length} assignment(s)`);
}

async function fixQuizzes() {
  const quizzes = await Quiz.collection.find({}).toArray();

  for (const item of quizzes) {
    const updateData = {
      instructorId: toObjectId(item.instructorId) || DEFAULT_INSTRUCTOR_ID,
      lessonId: item.lessonId ? toObjectId(item.lessonId) : null,
    };

    const fixedCourseId = toObjectId(item.courseId);
    if (fixedCourseId) {
      updateData.courseId = fixedCourseId;
    }

    await Quiz.collection.updateOne(
      { _id: item._id },
      { $set: updateData }
    );
  }

  console.log(`✅ Fixed ${quizzes.length} quiz(zes)`);
}

async function fixEnrollments() {
  const enrollments = await Enrollment.collection.find({}).toArray();

  for (const item of enrollments) {
    const updateData = {
      studentId: toObjectId(item.studentId),
      courseId: toObjectId(item.courseId),
      lastLessonId: item.lastLessonId ? toObjectId(item.lastLessonId) : null,
      completedLessons: toObjectIdArray(item.completedLessons),
    };

    await Enrollment.collection.updateOne(
      { _id: item._id },
      { $set: updateData }
    );
  }

  console.log(`✅ Fixed ${enrollments.length} enrollment(s)`);
}

async function rebuildCourseLessons() {
  const courses = await Course.collection.find({}).toArray();
  const lessons = await Lesson.collection.find({ isPublished: true }).toArray();

  for (const course of courses) {
    const courseLessons = lessons
      .filter(
        (lesson) =>
          String(lesson.courseId) === String(course._id) && lesson.courseId
      )
      .sort((a, b) => {
        const orderA = a.order ?? 999999;
        const orderB = b.order ?? 999999;
        if (orderA !== orderB) return orderA - orderB;

        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeA - timeB;
      });

    const lessonIds = courseLessons.map((lesson) => lesson._id);

    await Course.collection.updateOne(
      { _id: course._id },
      {
        $set: {
          lessonIds,
          totalLessons: lessonIds.length,
        },
      }
    );
  }

  console.log(`✅ Rebuilt lessonIds for ${courses.length} course(s)`);
}

async function run() {
  await connectDatabase();

  await fixCourses();
  await fixLessons();
  await fixMaterials();
  await fixAssignments();
  await fixQuizzes();
  await fixEnrollments();
  await rebuildCourseLessons();

  console.log("🎉 DONE FIX DATA");
  process.exit(0);
}

run().catch((error) => {
  console.error("FIX ERROR:", error);
  process.exit(1);
});