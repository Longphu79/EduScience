import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDatabase } from "../config/Database.js";

import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import Material from "../models/Material.js";
import Assignment from "../models/Assignment.js";
import Quiz from "../models/Quiz.js";

dotenv.config();

const DEFAULT_INSTRUCTOR_ID = new mongoose.Types.ObjectId(
  "697772345805dde1c5f090cb"
);

const DEFAULT_SECTION_ID = new mongoose.Types.ObjectId(
  "699999999999999999999999"
);

function normalizeCategory(category = "") {
  const value = String(category).toLowerCase().trim();

  if (value.includes("frontend")) return "frontend";
  if (value.includes("backend")) return "backend";
  if (value.includes("database")) return "database";
  if (value.includes("ui")) return "ui-ux";
  if (value.includes("mobile")) return "mobile";
  if (value.includes("flutter")) return "mobile";

  return "general";
}

function getYoutubeVideosByCategory(category) {
  switch (category) {
    case "frontend":
      return [
        "https://www.youtube.com/watch?v=30LWjhZzg50",
        "https://www.youtube.com/watch?v=ahCwqrYpIuM",
        "https://www.youtube.com/watch?v=zQnBQ4tB3ZA",
        "https://www.youtube.com/watch?v=jrKcJxF0lAU",
      ];
    case "backend":
      return [
        "https://www.youtube.com/watch?v=lsMQRaeKNDk",
        "https://www.youtube.com/watch?v=pKd0Rpw7O48",
        "https://www.youtube.com/watch?v=-MTSQjw5DrM",
        "https://www.youtube.com/watch?v=7YcW25PHnAA",
      ];
    case "database":
      return [
        "https://www.youtube.com/watch?v=ztHopE5Wnpc",
        "https://www.youtube.com/watch?v=HXV3zeQKqGY",
        "https://www.youtube.com/watch?v=5OdVJbNCSso",
        "https://www.youtube.com/watch?v=qw--VYLpxG4",
      ];
    case "ui-ux":
      return [
        "https://www.youtube.com/watch?v=c9Wg6Cb_YlU",
        "https://www.youtube.com/watch?v=Ovj4hFxko7c",
        "https://www.youtube.com/watch?v=_Hp_dI0DzY4",
        "https://www.youtube.com/watch?v=3YvN3E6qHfs",
      ];
    case "mobile":
      return [
        "https://www.youtube.com/watch?v=1gDhl4leEzA",
        "https://www.youtube.com/watch?v=x0uinJvhNxI",
        "https://www.youtube.com/watch?v=VPvVD8t02U8",
        "https://www.youtube.com/watch?v=CD1Y2DmL5JM",
      ];
    default:
      return [
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      ];
  }
}

function buildLessons(course) {
  const category = normalizeCategory(course.category);
  const videos = getYoutubeVideosByCategory(category);

  if (category === "ui-ux") {
    return [
      {
        title: "Design Thinking Basics",
        description: "Understand user needs, define design problems, and explore user-centered thinking.",
        videoUrl: videos[0],
        materialUrl: "",
        duration: 15,
        order: 1,
        sectionId: DEFAULT_SECTION_ID,
        courseId: course._id,
        isPreview: true,
        isPublished: true,
      },
      {
        title: "Wireframing and Layout Principles",
        description: "Learn how to structure screens with hierarchy, spacing, and layout balance.",
        videoUrl: videos[1],
        materialUrl: "",
        duration: 18,
        order: 2,
        sectionId: DEFAULT_SECTION_ID,
        courseId: course._id,
        isPreview: false,
        isPublished: true,
      },
      {
        title: "Color, Typography and Visual Consistency",
        description: "Apply color systems and typography rules to improve usability and aesthetics.",
        videoUrl: videos[2],
        materialUrl: "",
        duration: 16,
        order: 3,
        sectionId: DEFAULT_SECTION_ID,
        courseId: course._id,
        isPreview: false,
        isPublished: true,
      },
      {
        title: "Usability and Feedback Loops",
        description: "Evaluate usability, collect feedback, and iterate on interface designs.",
        videoUrl: videos[3],
        materialUrl: "",
        duration: 17,
        order: 4,
        sectionId: DEFAULT_SECTION_ID,
        courseId: course._id,
        isPreview: false,
        isPublished: true,
      },
    ];
  }

  if (category === "mobile") {
    return [
      {
        title: "Widgets and Layout Basics",
        description: "Explore widgets, containers, alignment, and layout composition for mobile UI.",
        videoUrl: videos[0],
        materialUrl: "",
        duration: 16,
        order: 1,
        sectionId: DEFAULT_SECTION_ID,
        courseId: course._id,
        isPreview: true,
        isPublished: true,
      },
      {
        title: "Navigation Between Screens",
        description: "Build multi-screen flows and manage route navigation cleanly.",
        videoUrl: videos[1],
        materialUrl: "",
        duration: 18,
        order: 2,
        sectionId: DEFAULT_SECTION_ID,
        courseId: course._id,
        isPreview: false,
        isPublished: true,
      },
      {
        title: "State and User Interaction",
        description: "Handle input, interactions, and simple state updates inside the app.",
        videoUrl: videos[2],
        materialUrl: "",
        duration: 19,
        order: 3,
        sectionId: DEFAULT_SECTION_ID,
        courseId: course._id,
        isPreview: false,
        isPublished: true,
      },
      {
        title: "Reusable Components and App Structure",
        description: "Organize reusable widgets and structure a maintainable project.",
        videoUrl: videos[3],
        materialUrl: "",
        duration: 20,
        order: 4,
        sectionId: DEFAULT_SECTION_ID,
        courseId: course._id,
        isPreview: false,
        isPublished: true,
      },
    ];
  }

  if (category === "frontend") {
    return [
      {
        title: "Core Syntax and Types",
        description: "Understand essential syntax, primitive types, and safe typing patterns.",
        videoUrl: videos[0],
        materialUrl: "",
        duration: 14,
        order: 1,
        sectionId: DEFAULT_SECTION_ID,
        courseId: course._id,
        isPreview: true,
        isPublished: true,
      },
      {
        title: "Interfaces and Object Modeling",
        description: "Model real data structures with reusable interfaces and type aliases.",
        videoUrl: videos[1],
        materialUrl: "",
        duration: 17,
        order: 2,
        sectionId: DEFAULT_SECTION_ID,
        courseId: course._id,
        isPreview: false,
        isPublished: true,
      },
      {
        title: "Functions, Generics and Reuse",
        description: "Create safer reusable functions using generics and inference.",
        videoUrl: videos[2],
        materialUrl: "",
        duration: 18,
        order: 3,
        sectionId: DEFAULT_SECTION_ID,
        courseId: course._id,
        isPreview: false,
        isPublished: true,
      },
      {
        title: "Tooling and Practical Application",
        description: "Use tooling and apply types effectively in a modern frontend workflow.",
        videoUrl: videos[3],
        materialUrl: "",
        duration: 16,
        order: 4,
        sectionId: DEFAULT_SECTION_ID,
        courseId: course._id,
        isPreview: false,
        isPublished: true,
      },
    ];
  }

  if (category === "backend") {
    return [
      {
        title: "REST Principles and Resources",
        description: "Understand resources, endpoints, HTTP verbs, and consistent API structure.",
        videoUrl: videos[0],
        materialUrl: "",
        duration: 16,
        order: 1,
        sectionId: DEFAULT_SECTION_ID,
        courseId: course._id,
        isPreview: true,
        isPublished: true,
      },
      {
        title: "Request Design and Validation",
        description: "Design payloads, validation rules, and meaningful error responses.",
        videoUrl: videos[1],
        materialUrl: "",
        duration: 18,
        order: 2,
        sectionId: DEFAULT_SECTION_ID,
        courseId: course._id,
        isPreview: false,
        isPublished: true,
      },
      {
        title: "Pagination, Filtering and Sorting",
        description: "Implement scalable list endpoints with clean filtering behavior.",
        videoUrl: videos[2],
        materialUrl: "",
        duration: 19,
        order: 3,
        sectionId: DEFAULT_SECTION_ID,
        courseId: course._id,
        isPreview: false,
        isPublished: true,
      },
      {
        title: "Versioning and API Consistency",
        description: "Maintain long-term API consistency with good versioning practices.",
        videoUrl: videos[3],
        materialUrl: "",
        duration: 17,
        order: 4,
        sectionId: DEFAULT_SECTION_ID,
        courseId: course._id,
        isPreview: false,
        isPublished: true,
      },
    ];
  }

  if (category === "database") {
    return [
      {
        title: "Database Modeling Basics",
        description: "Learn entities, relationships, and schema planning for structured data.",
        videoUrl: videos[0],
        materialUrl: "",
        duration: 15,
        order: 1,
        sectionId: DEFAULT_SECTION_ID,
        courseId: course._id,
        isPreview: true,
        isPublished: true,
      },
      {
        title: "Normalization and Constraints",
        description: "Reduce redundancy and improve data consistency with normalization.",
        videoUrl: videos[1],
        materialUrl: "",
        duration: 18,
        order: 2,
        sectionId: DEFAULT_SECTION_ID,
        courseId: course._id,
        isPreview: false,
        isPublished: true,
      },
      {
        title: "Query Design and Performance",
        description: "Write effective queries and think about performance from the start.",
        videoUrl: videos[2],
        materialUrl: "",
        duration: 19,
        order: 3,
        sectionId: DEFAULT_SECTION_ID,
        courseId: course._id,
        isPreview: false,
        isPublished: true,
      },
      {
        title: "Indexes and Practical Data Retrieval",
        description: "Use indexes and retrieval strategies for common product needs.",
        videoUrl: videos[3],
        materialUrl: "",
        duration: 17,
        order: 4,
        sectionId: DEFAULT_SECTION_ID,
        courseId: course._id,
        isPreview: false,
        isPublished: true,
      },
    ];
  }

  return [
    {
      title: "Course Introduction",
      description: "Overview of the course and the main skills you will build.",
      videoUrl: videos[0],
      materialUrl: "",
      duration: 15,
      order: 1,
      sectionId: DEFAULT_SECTION_ID,
      courseId: course._id,
      isPreview: true,
      isPublished: true,
    },
    {
      title: "Core Concepts",
      description: "Learn the main concepts and workflow used in this subject.",
      videoUrl: videos[1],
      materialUrl: "",
      duration: 18,
      order: 2,
      sectionId: DEFAULT_SECTION_ID,
      courseId: course._id,
      isPreview: false,
      isPublished: true,
    },
    {
      title: "Hands-on Practice",
      description: "Practice what you learned through guided activities.",
      videoUrl: videos[2],
      materialUrl: "",
      duration: 18,
      order: 3,
      sectionId: DEFAULT_SECTION_ID,
      courseId: course._id,
      isPreview: false,
      isPublished: true,
    },
    {
      title: "Wrap-up and Application",
      description: "Consolidate learning and prepare to apply it in real projects.",
      videoUrl: videos[3],
      materialUrl: "",
      duration: 16,
      order: 4,
      sectionId: DEFAULT_SECTION_ID,
      courseId: course._id,
      isPreview: false,
      isPublished: true,
    },
  ];
}

function buildMaterials(course) {
  const title = course.title || "Course";
  const slug = course.slug || String(course._id);
  const category = normalizeCategory(course.category);

  const common = {
    courseId: course._id,
    lessonId: null,
    instructorId:
      course.instructorId instanceof mongoose.Types.ObjectId
        ? course.instructorId
        : new mongoose.Types.ObjectId(String(course.instructorId || DEFAULT_INSTRUCTOR_ID)),
    isPublished: true,
  };

  if (category === "ui-ux") {
    return [
      {
        ...common,
        title: `${title} - Design Thinking Notes`,
        description: "Foundational notes for user-centered design thinking and UX process.",
        fileUrl: `https://example.com/files/${slug}-design-thinking-notes.pdf`,
        fileName: `${slug}-design-thinking-notes.pdf`,
        fileType: "pdf",
        fileSize: 1245000,
      },
      {
        ...common,
        title: `${title} - Wireframe Practice Kit`,
        description: "Practice kit for wireframes, layout exercises, and interface structure.",
        fileUrl: `https://example.com/files/${slug}-wireframe-practice-kit.zip`,
        fileName: `${slug}-wireframe-practice-kit.zip`,
        fileType: "zip",
        fileSize: 4589000,
      },
    ];
  }

  if (category === "mobile") {
    return [
      {
        ...common,
        title: `${title} - Mobile Widgets Cheat Sheet`,
        description: "Quick reference for important mobile UI widgets and reusable components.",
        fileUrl: `https://example.com/files/${slug}-widgets-cheatsheet.pdf`,
        fileName: `${slug}-widgets-cheatsheet.pdf`,
        fileType: "pdf",
        fileSize: 986000,
      },
      {
        ...common,
        title: `${title} - Starter Project`,
        description: "Starter source package for building and extending the course project.",
        fileUrl: `https://example.com/files/${slug}-starter-project.zip`,
        fileName: `${slug}-starter-project.zip`,
        fileType: "zip",
        fileSize: 5920000,
      },
    ];
  }

  if (category === "frontend") {
    return [
      {
        ...common,
        title: `${title} - Syntax Guide`,
        description: "Core syntax notes, examples, and usage patterns for this course.",
        fileUrl: `https://example.com/files/${slug}-syntax-guide.pdf`,
        fileName: `${slug}-syntax-guide.pdf`,
        fileType: "pdf",
        fileSize: 1134000,
      },
      {
        ...common,
        title: `${title} - Practice Exercises`,
        description: "Hands-on tasks and exercises to reinforce key concepts.",
        fileUrl: `https://example.com/files/${slug}-practice-exercises.zip`,
        fileName: `${slug}-practice-exercises.zip`,
        fileType: "zip",
        fileSize: 2750000,
      },
    ];
  }

  if (category === "backend") {
    return [
      {
        ...common,
        title: `${title} - API Checklist`,
        description: "Checklist and reference patterns for scalable backend design.",
        fileUrl: `https://example.com/files/${slug}-api-checklist.pdf`,
        fileName: `${slug}-api-checklist.pdf`,
        fileType: "pdf",
        fileSize: 842000,
      },
      {
        ...common,
        title: `${title} - Testing Collection`,
        description: "Collection for testing endpoints and sample requests.",
        fileUrl: `https://example.com/files/${slug}-testing-collection.json`,
        fileName: `${slug}-testing-collection.json`,
        fileType: "json",
        fileSize: 214000,
      },
    ];
  }

  if (category === "database") {
    return [
      {
        ...common,
        title: `${title} - Database Modeling Guide`,
        description: "Schema design notes, relationships, and modeling examples.",
        fileUrl: `https://example.com/files/${slug}-database-modeling-guide.pdf`,
        fileName: `${slug}-database-modeling-guide.pdf`,
        fileType: "pdf",
        fileSize: 990000,
      },
      {
        ...common,
        title: `${title} - Query Practice Pack`,
        description: "Practice queries and exercises for retrieving and transforming data.",
        fileUrl: `https://example.com/files/${slug}-query-practice-pack.zip`,
        fileName: `${slug}-query-practice-pack.zip`,
        fileType: "zip",
        fileSize: 2400000,
      },
    ];
  }

  return [
    {
      ...common,
      title: `${title} - Course Notes`,
      description: "Core notes and summary for this course.",
      fileUrl: `https://example.com/files/${slug}-course-notes.pdf`,
      fileName: `${slug}-course-notes.pdf`,
      fileType: "pdf",
      fileSize: 800000,
    },
    {
      ...common,
      title: `${title} - Practice Pack`,
      description: "Supplementary resources and practice files.",
      fileUrl: `https://example.com/files/${slug}-practice-pack.zip`,
      fileName: `${slug}-practice-pack.zip`,
      fileType: "zip",
      fileSize: 2200000,
    },
  ];
}

function buildAssignments(course) {
  const title = course.title || "Course";
  const category = normalizeCategory(course.category);

  const common = {
    courseId: course._id,
    lessonId: null,
    instructorId:
      course.instructorId instanceof mongoose.Types.ObjectId
        ? course.instructorId
        : new mongoose.Types.ObjectId(String(course.instructorId || DEFAULT_INSTRUCTOR_ID)),
    allowResubmit: true,
    maxScore: 100,
    isPublished: true,
  };

  if (category === "ui-ux") {
    return [
      {
        ...common,
        title: "Create a User Flow",
        description: `Design a user flow for a small product based on concepts learned in ${title}.`,
        dueDate: new Date("2026-03-25T23:59:00.000Z"),
        attachmentUrls: ["https://example.com/files/uiux-user-flow-assignment.pdf"],
      },
      {
        ...common,
        title: "Low-Fidelity Wireframe Task",
        description: `Create low-fidelity wireframes and explain layout decisions for ${title}.`,
        dueDate: new Date("2026-03-29T23:59:00.000Z"),
        attachmentUrls: ["https://example.com/files/uiux-wireframe-assignment.pdf"],
      },
    ];
  }

  if (category === "mobile") {
    return [
      {
        ...common,
        title: "Build a Multi-Screen Mobile App",
        description: `Create a mini mobile app with at least 3 screens and navigation flow.`,
        dueDate: new Date("2026-03-26T23:59:00.000Z"),
        attachmentUrls: ["https://example.com/files/mobile-multi-screen-assignment.pdf"],
      },
      {
        ...common,
        title: "Reusable Widgets Challenge",
        description: `Refactor a UI into reusable widgets/components and explain the structure.`,
        dueDate: new Date("2026-03-30T23:59:00.000Z"),
        attachmentUrls: ["https://example.com/files/mobile-widgets-assignment.pdf"],
      },
    ];
  }

  if (category === "frontend") {
    return [
      {
        ...common,
        title: "Type Modeling Exercise",
        description: `Model a realistic data structure and explain the chosen typing strategy.`,
        dueDate: new Date("2026-03-24T23:59:00.000Z"),
        attachmentUrls: ["https://example.com/files/frontend-type-modeling.pdf"],
      },
      {
        ...common,
        title: "Utility Functions Practice",
        description: `Create reusable helper functions and document how they improve maintainability.`,
        dueDate: new Date("2026-03-28T23:59:00.000Z"),
        attachmentUrls: ["https://example.com/files/frontend-utility-functions.pdf"],
      },
    ];
  }

  if (category === "backend") {
    return [
      {
        ...common,
        title: "Design REST Endpoints",
        description: `Design backend endpoints, request/response shapes, and validation rules.`,
        dueDate: new Date("2026-03-25T23:59:00.000Z"),
        attachmentUrls: ["https://example.com/files/backend-rest-endpoints.pdf"],
      },
      {
        ...common,
        title: "Pagination and Filtering Strategy",
        description: `Propose pagination, filtering, and sorting strategy for a production API.`,
        dueDate: new Date("2026-03-30T23:59:00.000Z"),
        attachmentUrls: ["https://example.com/files/backend-pagination-filtering.pdf"],
      },
    ];
  }

  if (category === "database") {
    return [
      {
        ...common,
        title: "Design a Relational Schema",
        description: `Create a normalized schema for a realistic business scenario.`,
        dueDate: new Date("2026-03-24T23:59:00.000Z"),
        attachmentUrls: ["https://example.com/files/database-schema-design.pdf"],
      },
      {
        ...common,
        title: "Advanced Query Practice",
        description: `Write queries for reporting, aggregation, and filtered retrieval.`,
        dueDate: new Date("2026-03-29T23:59:00.000Z"),
        attachmentUrls: ["https://example.com/files/database-query-practice.pdf"],
      },
    ];
  }

  return [
    {
      ...common,
      title: `${title} Assignment 1`,
      description: `Complete the first practical task for ${title}.`,
      dueDate: new Date("2026-03-25T23:59:00.000Z"),
      attachmentUrls: ["https://example.com/files/general-assignment-1.pdf"],
    },
    {
      ...common,
      title: `${title} Assignment 2`,
      description: `Complete the second practical task for ${title}.`,
      dueDate: new Date("2026-03-30T23:59:00.000Z"),
      attachmentUrls: ["https://example.com/files/general-assignment-2.pdf"],
    },
  ];
}

function createQuestion(seed, category, quizIndex) {
  const n = seed + 1;

  if (category === "ui-ux") {
    return {
      questionText: `UI/UX Question ${quizIndex}.${n}: Which option best reflects user-centered design thinking?`,
      type: "single",
      points: 1,
      explanation: "User-centered design focuses on user needs, testing, and iteration.",
      options: [
        { text: "Understand user problems before designing solutions", isCorrect: true },
        { text: "Start with colors and decoration first", isCorrect: false },
        { text: "Ignore usability testing for speed", isCorrect: false },
        { text: "Design only based on personal preference", isCorrect: false },
      ],
    };
  }

  if (category === "mobile") {
    return {
      questionText: `Mobile Question ${quizIndex}.${n}: Which choice is best for building reusable UI structure in a mobile app?`,
      type: "single",
      points: 1,
      explanation: "Reusable components/widgets improve maintainability and consistency.",
      options: [
        { text: "Break UI into reusable widgets/components", isCorrect: true },
        { text: "Duplicate all UI code on every screen", isCorrect: false },
        { text: "Avoid layout hierarchy completely", isCorrect: false },
        { text: "Keep all screens in one giant function", isCorrect: false },
      ],
    };
  }

  if (category === "frontend") {
    return {
      questionText: `Frontend Question ${quizIndex}.${n}: Why is static typing useful?`,
      type: "single",
      points: 1,
      explanation: "Static typing helps catch mistakes earlier and improves developer tooling.",
      options: [
        { text: "It helps catch errors earlier in development", isCorrect: true },
        { text: "It removes the need for testing", isCorrect: false },
        { text: "It guarantees zero bugs in production", isCorrect: false },
        { text: "It makes code impossible to refactor", isCorrect: false },
      ],
    };
  }

  if (category === "backend") {
    return {
      questionText: `Backend Question ${quizIndex}.${n}: What is a good REST API design principle?`,
      type: "single",
      points: 1,
      explanation: "REST APIs should use predictable resource naming and consistent behavior.",
      options: [
        { text: "Use consistent resource-oriented endpoints", isCorrect: true },
        { text: "Return random response shapes per request", isCorrect: false },
        { text: "Use verbs everywhere in endpoint names", isCorrect: false },
        { text: "Ignore HTTP status codes", isCorrect: false },
      ],
    };
  }

  if (category === "database") {
    return {
      questionText: `Database Question ${quizIndex}.${n}: Why is normalization important?`,
      type: "single",
      points: 1,
      explanation: "Normalization helps reduce duplication and improve consistency.",
      options: [
        { text: "It reduces duplicated data and inconsistency", isCorrect: true },
        { text: "It always makes queries slower and worse", isCorrect: false },
        { text: "It removes relationships between entities", isCorrect: false },
        { text: "It eliminates the need for indexes", isCorrect: false },
      ],
    };
  }

  return {
    questionText: `General Question ${quizIndex}.${n}: Which statement is correct?`,
    type: "single",
    points: 1,
    explanation: "This is a standard single-choice practice question.",
    options: [
      { text: "This is the correct answer", isCorrect: true },
      { text: "This is incorrect", isCorrect: false },
      { text: "This is also incorrect", isCorrect: false },
      { text: "This is not correct", isCorrect: false },
    ],
  };
}

function buildQuizzes(course) {
  const title = course.title || "Course";
  const category = normalizeCategory(course.category);

  return [1, 2].map((quizIndex) => ({
    title: `${title} - Quiz ${quizIndex}`,
    description: `Assessment ${quizIndex} for ${title}.`,
    courseId: course._id,
    lessonId: null,
    instructorId:
      course.instructorId instanceof mongoose.Types.ObjectId
        ? course.instructorId
        : new mongoose.Types.ObjectId(String(course.instructorId || DEFAULT_INSTRUCTOR_ID)),
    timeLimit: quizIndex === 1 ? 15 : 20,
    passingScore: 70,
    isPublished: true,
    questions: Array.from({ length: 10 }, (_, i) =>
      createQuestion(i, category, quizIndex)
    ),
  }));
}

async function run() {
  await connectDatabase();

  const courses = await Course.find({ status: "published" }).lean();

  console.log(`Found ${courses.length} published course(s)`);

  for (const course of courses) {
    console.log(`\n--- Processing course: ${course.title} (${course._id}) ---`);

    await Lesson.deleteMany({ courseId: course._id });
    await Material.deleteMany({ courseId: course._id });
    await Assignment.deleteMany({ courseId: course._id });
    await Quiz.deleteMany({ courseId: course._id });

    const lessons = buildLessons(course);
    const insertedLessons = await Lesson.insertMany(lessons);

    const materials = buildMaterials(course);
    const assignments = buildAssignments(course);
    const quizzes = buildQuizzes(course);

    await Material.insertMany(materials);
    await Assignment.insertMany(assignments);
    await Quiz.insertMany(quizzes);

    await Course.updateOne(
      { _id: course._id },
      {
        $set: {
          lessonIds: insertedLessons
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((lesson) => lesson._id),
          totalLessons: insertedLessons.length,
        },
      }
    );

    console.log(
      `Seeded ${insertedLessons.length} lessons, ${materials.length} materials, ${assignments.length} assignments, ${quizzes.length} quizzes`
    );
  }

  console.log("\n✅ DONE SEED ALL COURSE MODULES");
  process.exit(0);
}

run().catch((error) => {
  console.error("❌ SEED ERROR:", error);
  process.exit(1);
});