import bcrypt from "bcryptjs";

import Admin from "../models/Admin.js";
import Cart from "../models/Cart.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Instructor from "../models/Instructor.js";
import InstructorPayoutAccount from "../models/InstructorPayoutAccount.js";
import Lesson from "../models/Lesson.js";
import LessonComment from "../models/LessonComment.js";
import LessonNotebook from "../models/LessonNotebook.js";
import LessonProgress from "../models/LessonProgress.js";
import Order from "../models/Order.js";
import PayoutRequest from "../models/PayoutRequest.js";
import Review from "../models/Review.js";
import Student from "../models/Student.js";
import User from "../models/User.js";
import Wishlist from "../models/Wishlist.js";
import { buildSeedLessonMedia, getSeedMediaStrategy } from "./seedMediaAssets.js";

export const QA_PASSWORD = "QaDemo123!";

export const QA_ACCOUNTS = {
  student: {
    username: "qa.student",
    email: "qa.student@eduscience.local",
    role: "student",
  },
  instructor: {
    username: "qa.instructor",
    email: "qa.instructor@eduscience.local",
    role: "instructor",
  },
  instructorAlt: {
    username: "qa.instructor.alt",
    email: "qa.instructor.alt@eduscience.local",
    role: "instructor",
  },
  admin: {
    username: "qa.admin",
    email: "qa.admin@eduscience.local",
    role: "admin",
  },
};

export const QA_PUBLIC_COURSES = [
  "qa-physics-foundations",
  "qa-data-visualization",
  "qa-astronomy-night-sky",
  "qa-chemistry-lab-toolkit",
  "qa-algebra-sprint",
  "qa-biology-basics",
  "qa-earth-science-field-lab",
  "qa-statistics-core-skills",
];

const lessonResourceUrl = (courseSlug, order, kind) =>
  `https://qa.eduscience.local/resources/${courseSlug}/lesson-${order}-${kind}`;

const buildOrderItemsSignature = (items) =>
  items
    .map((item) => `${item.courseId.toString()}:${item.quantity ?? 1}`)
    .sort((a, b) => a.localeCompare(b))
    .join("|");

const courseDefinitions = [
  {
    slug: "qa-physics-foundations",
    title: "QA Physics Foundations",
    shortDescription: "A public QA course used to verify catalog, checkout, and player flows.",
    description:
      "Covers motion, forces, and energy with enough lesson structure to exercise the student learning workflow.",
    category: "Physics",
    level: "beginner",
    language: "en",
    duration: 6,
    price: 149000,
    salePrice: 99000,
    isPopular: true,
    status: "published",
    rating: 4.8,
    totalReviews: 12,
    totalEnrollments: 128,
    owner: "instructor",
    lessons: [
      {
        title: "Welcome to Physics",
        description: "Preview the course structure and expectations.",
        duration: 12,
        order: 1,
        isPreview: true,
      },
      {
        title: "Newtonian Motion",
        description: "Understand velocity, acceleration, and force.",
        duration: 24,
        order: 2,
      },
      {
        title: "Energy and Momentum",
        description: "Apply the core laws to common scenarios.",
        duration: 28,
        order: 3,
      },
    ],
  },
  {
    slug: "qa-data-visualization",
    title: "QA Data Visualization",
    shortDescription: "A completed learning sample for student dashboard and review state.",
    description:
      "A compact analytics course with completed progress fixtures so My Courses and player states stay non-empty.",
    category: "Data Science",
    level: "intermediate",
    language: "en",
    duration: 5,
    price: 189000,
    salePrice: 149000,
    isPopular: true,
    status: "published",
    rating: 4.9,
    totalReviews: 9,
    totalEnrollments: 94,
    owner: "instructor",
    lessons: [
      {
        title: "Reading Charts with Confidence",
        description: "Build intuition around shape, scale, and color.",
        duration: 18,
        order: 1,
        isPreview: true,
      },
      {
        title: "Storytelling with Dashboards",
        description: "Turn metrics into a narrative stakeholders can act on.",
        duration: 26,
        order: 2,
      },
    ],
  },
  {
    slug: "qa-astronomy-night-sky",
    title: "QA Astronomy Night Sky",
    shortDescription: "Used for wishlist and expired-order QA scenarios.",
    description:
      "A public astronomy course that stays un-enrolled in the seeded student account for wishlist and order history checks.",
    category: "Astronomy",
    level: "beginner",
    language: "en",
    duration: 4,
    price: 119000,
    salePrice: 99000,
    isPopular: true,
    status: "published",
    rating: 4.6,
    totalReviews: 6,
    totalEnrollments: 51,
    owner: "instructorAlt",
    lessons: [
      {
        title: "Finding Constellations",
        description: "Use seasonal markers to navigate the sky.",
        duration: 16,
        order: 1,
        isPreview: true,
      },
      {
        title: "Telescopes and Observation Logs",
        description: "Turn observation into a repeatable practice.",
        duration: 21,
        order: 2,
      },
    ],
  },
  {
    slug: "qa-chemistry-lab-toolkit",
    title: "QA Chemistry Lab Toolkit",
    shortDescription: "Seeded in the student cart so checkout pages never start empty.",
    description:
      "A chemistry course intentionally left in cart for the seeded student account to exercise checkout and webhook fulfillment.",
    category: "Chemistry",
    level: "intermediate",
    language: "en",
    duration: 7,
    price: 159000,
    salePrice: 129000,
    isPopular: true,
    status: "published",
    rating: 4.7,
    totalReviews: 11,
    totalEnrollments: 73,
    owner: "instructor",
    lessons: [
      {
        title: "Lab Safety Foundations",
        description: "Set up an experimental workflow safely.",
        duration: 14,
        order: 1,
        isPreview: true,
      },
      {
        title: "Measuring Reactions",
        description: "Collect dependable experimental data.",
        duration: 30,
        order: 2,
      },
      {
        title: "Reporting Results",
        description: "Summarize and defend your findings.",
        duration: 18,
        order: 3,
      },
    ],
  },
  {
    slug: "qa-algebra-sprint",
    title: "QA Algebra Sprint",
    shortDescription: "Another public course to keep catalog, wishlist, and search populated.",
    description:
      "A compact mathematics course used to keep discovery surfaces populated and to give the wishlist multiple items.",
    category: "Mathematics",
    level: "beginner",
    language: "en",
    duration: 3,
    price: 89000,
    isPopular: true,
    status: "published",
    rating: 4.5,
    totalReviews: 5,
    totalEnrollments: 66,
    owner: "instructorAlt",
    lessons: [
      {
        title: "Variables and Expressions",
        description: "Refresh the basics before you solve equations.",
        duration: 12,
        order: 1,
        isPreview: true,
      },
      {
        title: "Equation Solving Drills",
        description: "Practice with increasingly tricky examples.",
        duration: 19,
        order: 2,
      },
    ],
  },
  {
    slug: "qa-biology-basics",
    title: "QA Biology Basics",
    shortDescription: "Keeps home and catalog lists full with another public learning option.",
    description:
      "An intro biology course seeded for discovery screens and public course detail QA.",
    category: "Biology",
    level: "beginner",
    language: "en",
    duration: 4,
    price: 99000,
    isPopular: true,
    status: "published",
    rating: 4.4,
    totalReviews: 7,
    totalEnrollments: 47,
    owner: "instructor",
    lessons: [
      {
        title: "Cells and Structure",
        description: "Understand the basic unit of life.",
        duration: 11,
        order: 1,
        isPreview: true,
      },
      {
        title: "DNA and Inheritance",
        description: "Connect structure to biological traits.",
        duration: 22,
        order: 2,
      },
    ],
  },
  {
    slug: "qa-earth-science-field-lab",
    title: "QA Earth Science Field Lab",
    shortDescription: "Desktop QA course with visual geology lessons and a seeded public preview.",
    description:
      "A public earth science course used to keep discovery rails full and provide another video-first course for manual QA.",
    category: "Earth Science",
    level: "intermediate",
    language: "en",
    duration: 5,
    price: 129000,
    salePrice: 109000,
    isPopular: true,
    status: "published",
    rating: 4.7,
    totalReviews: 8,
    totalEnrollments: 58,
    owner: "instructorAlt",
    lessons: [
      {
        title: "Reading Rock Layers",
        description: "Build intuition around strata, age, and field notes.",
        duration: 17,
        order: 1,
        isPreview: true,
      },
      {
        title: "Rivers, Erosion, and Sediment",
        description: "Connect moving water to long-term landscape change.",
        duration: 23,
        order: 2,
      },
      {
        title: "Field Lab Debrief",
        description: "Turn observations into a structured interpretation.",
        duration: 16,
        order: 3,
      },
    ],
  },
  {
    slug: "qa-statistics-core-skills",
    title: "QA Statistics Core Skills",
    shortDescription: "Another public seeded course focused on practical statistics workflows.",
    description:
      "A public statistics course for catalog density, checkout verification, and student desktop learning checks.",
    category: "Statistics",
    level: "intermediate",
    language: "en",
    duration: 4,
    price: 139000,
    salePrice: 119000,
    isPopular: true,
    status: "published",
    rating: 4.6,
    totalReviews: 10,
    totalEnrollments: 64,
    owner: "instructor",
    lessons: [
      {
        title: "Descriptive Statistics",
        description: "Summarize datasets without losing the story in the numbers.",
        duration: 20,
        order: 1,
        isPreview: true,
      },
      {
        title: "Confidence Intervals",
        description: "Understand uncertainty before presenting decisions.",
        duration: 22,
        order: 2,
      },
    ],
  },
  {
    slug: "qa-course-publishing-sandbox",
    title: "QA Course Publishing Sandbox",
    shortDescription: "Used to verify draft visibility and authoring status controls.",
    description:
      "A non-public course kept in draft so instructors and admins can verify visibility changes.",
    category: "Operations",
    level: "advanced",
    language: "en",
    duration: 2,
    price: 0,
    isFree: true,
    isPopular: false,
    status: "draft",
    rating: 0,
    totalReviews: 0,
    totalEnrollments: 0,
    owner: "instructor",
    lessons: [
      {
        title: "Draft Review Checklist",
        description: "Internal QA checklist before publishing.",
        duration: 10,
        order: 1,
        isPreview: false,
      },
    ],
  },
  {
    slug: "qa-archived-legacy-course",
    title: "QA Archived Legacy Course",
    shortDescription: "Used to verify archived visibility in authoring flow.",
    description:
      "An archived course fixture for status badge and admin ownership QA.",
    category: "Archive",
    level: "advanced",
    language: "en",
    duration: 1,
    price: 0,
    isFree: true,
    isPopular: false,
    status: "archived",
    rating: 0,
    totalReviews: 0,
    totalEnrollments: 0,
    owner: "instructorAlt",
    lessons: [
      {
        title: "Legacy Reference",
        description: "Archived internal material.",
        duration: 8,
        order: 1,
        isPreview: false,
      },
    ],
  },
];

const buildLessonObjectives = (courseTitle, lessonTitle) => [
  `Understand the core idea behind ${lessonTitle.toLowerCase()}.`,
  `Apply ${courseTitle.toLowerCase()} concepts to a practical scenario.`,
];

const buildLessonNotes = (courseTitle, lessonTitle) =>
  `${lessonTitle} extends the ${courseTitle} learning path with structured notes, reflection prompts, and lab-style thinking cues for the new learning UI.`;

const buildLessonResources = (courseSlug, lessonDefinition) => [
  {
    title: `${lessonDefinition.title} worksheet`,
    url: lessonResourceUrl(courseSlug, lessonDefinition.order, "worksheet"),
    type: "worksheet",
  },
  {
    title: `${lessonDefinition.title} summary slides`,
    url: lessonResourceUrl(courseSlug, lessonDefinition.order, "slides"),
    type: "slides",
  },
];

const cleanupExistingQaData = async () => {
  const existingUsers = await User.find({
    username: { $in: Object.values(QA_ACCOUNTS).map((account) => account.username) },
  }).select("_id");
  const userIds = existingUsers.map((user) => user._id);

  const existingStudents = await Student.find({ userId: { $in: userIds } }).select("_id");
  const studentIds = existingStudents.map((student) => student._id);

  const existingInstructors = await Instructor.find({
    userId: { $in: userIds },
  }).select("_id");
  const instructorIds = existingInstructors.map((instructor) => instructor._id);

  const existingCourses = await Course.find({
    $or: [
      { slug: { $in: courseDefinitions.map((course) => course.slug) } },
      { instructorId: { $in: instructorIds } },
    ],
  }).select("_id");
  const courseIds = existingCourses.map((course) => course._id);

  await Promise.all([
    Lesson.deleteMany({ courseId: { $in: courseIds } }),
    LessonComment.deleteMany({
      $or: [
        { lessonId: { $exists: true }, courseId: { $in: courseIds } },
        { authorUserId: { $in: userIds } },
      ],
    }),
    LessonProgress.deleteMany({
      $or: [
        { studentId: { $in: studentIds } },
        { courseId: { $in: courseIds } },
      ],
    }),
    LessonNotebook.deleteMany({
      $or: [
        { studentId: { $in: studentIds } },
        { courseId: { $in: courseIds } },
      ],
    }),
    Enrollment.deleteMany({
      $or: [
        { studentId: { $in: studentIds } },
        { courseId: { $in: courseIds } },
      ],
    }),
    Review.deleteMany({
      $or: [
        { studentId: { $in: studentIds } },
        { courseId: { $in: courseIds } },
      ],
    }),
    Order.deleteMany({
      $or: [
        { userId: { $in: userIds } },
        { "items.courseId": { $in: courseIds } },
      ],
    }),
    PayoutRequest.deleteMany({
      $or: [
        { instructorId: { $in: instructorIds } },
        { processedByUserId: { $in: userIds } },
      ],
    }),
    InstructorPayoutAccount.deleteMany({ instructorId: { $in: instructorIds } }),
    Cart.deleteMany({ user: { $in: userIds } }),
    Wishlist.deleteMany({ userId: { $in: userIds } }),
    Course.deleteMany({ _id: { $in: courseIds } }),
    Student.deleteMany({ userId: { $in: userIds } }),
    Instructor.deleteMany({ userId: { $in: userIds } }),
    Admin.deleteMany({ userId: { $in: userIds } }),
    User.deleteMany({ _id: { $in: userIds } }),
  ]);
};

const createUserFixtures = async () => {
  const password = await bcrypt.hash(QA_PASSWORD, 10);
  const users = {};

  for (const [key, account] of Object.entries(QA_ACCOUNTS)) {
    users[key] = await User.create({
      username: account.username,
      email: account.email,
      password,
      role: account.role,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        account.username,
      )}&background=111827&color=fff`,
    });
  }

  const student = await Student.create({
    userId: users.student._id,
    fullName: "QA Student",
    phone: "0901000001",
    address: "Ho Chi Minh City",
  });

  const instructor = await Instructor.create({
    userId: users.instructor._id,
    name: "QA Instructor",
    bio: "Primary QA instructor account used for authoring and catalog fixtures.",
    expertise: ["Physics", "Biology"],
    rating: 4.9,
    totalStudents: 42,
    revenue: 338000,
  });

  const instructorAlt = await Instructor.create({
    userId: users.instructorAlt._id,
    name: "QA Instructor Alt",
    bio: "Secondary instructor option for admin assignment and ownership reassignment flows.",
    expertise: ["Astronomy", "Mathematics"],
    rating: 4.7,
    totalStudents: 17,
    revenue: 186000,
  });

  const admin = await Admin.create({
    userId: users.admin._id,
    name: "QA Admin",
  });

  return {
    users,
    profiles: {
      student,
      instructor,
      instructorAlt,
      admin,
    },
  };
};

const createCourseFixtures = async ({ profiles }) => {
  const courses = {};
  const lessonsByCourseSlug = {};
  const uploadedMedia = [];

  for (const [courseIndex, definition] of courseDefinitions.entries()) {
    const ownerProfile = profiles[definition.owner];
    const preparedLessons = [];

    for (const [lessonIndex, lessonDefinition] of definition.lessons.entries()) {
      const media = await buildSeedLessonMedia({
        courseSlug: definition.slug,
        lessonOrder: lessonDefinition.order,
        seedIndex: courseIndex + lessonIndex,
      });

      preparedLessons.push({
        ...lessonDefinition,
        media,
      });
    }

    const previewLesson = preparedLessons.find((lesson) => lesson.isPreview) || preparedLessons[0];
    const course = await Course.create({
      title: definition.title,
      slug: definition.slug,
      shortDescription: definition.shortDescription,
      description: definition.description,
      category: definition.category,
      thumbnail: previewLesson?.media?.thumbnailUrl || "",
      previewVideo: previewLesson?.media?.videoUrl || "",
      level: definition.level,
      language: definition.language,
      duration: definition.duration,
      price: definition.price,
      salePrice: definition.salePrice,
      isFree: Boolean(definition.isFree),
      instructorId: ownerProfile._id,
      rating: definition.rating,
      totalReviews: definition.totalReviews,
      totalEnrollments: definition.totalEnrollments,
      totalLessons: definition.lessons.length,
      isPopular: definition.isPopular,
      status: definition.status,
    });

    courses[definition.slug] = course;
    lessonsByCourseSlug[definition.slug] = [];

    uploadedMedia.push({
      courseSlug: definition.slug,
      previewVideo: previewLesson?.media?.videoUrl || "",
      thumbnail: previewLesson?.media?.thumbnailUrl || "",
    });

    for (const lessonDefinition of preparedLessons) {
      const lesson = await Lesson.create({
        title: lessonDefinition.title,
        description: lessonDefinition.description,
        videoUrl: lessonDefinition.media.videoUrl,
        thumbnail: lessonDefinition.media.thumbnailUrl,
        duration: lessonDefinition.duration,
        estimatedCompletionMinutes: lessonDefinition.duration,
        order: lessonDefinition.order,
        courseId: course._id,
        isPreview: Boolean(lessonDefinition.isPreview),
        isPublished: lessonDefinition.isPublished ?? true,
        objectives: buildLessonObjectives(definition.title, lessonDefinition.title),
        notes: buildLessonNotes(definition.title, lessonDefinition.title),
        resources: buildLessonResources(definition.slug, lessonDefinition),
      });

      lessonsByCourseSlug[definition.slug].push(lesson);
    }
  }

  return { courses, lessonsByCourseSlug, uploadedMedia };
};

const createStudentFixtures = async ({ users, profiles, courses, lessonsByCourseSlug }) => {
  const inProgressCourse = courses["qa-physics-foundations"];
  const completedCourse = courses["qa-data-visualization"];
  const expiredOrderCourse = courses["qa-astronomy-night-sky"];
  const cartCourse = courses["qa-chemistry-lab-toolkit"];
  const wishlistCourses = [
    courses["qa-astronomy-night-sky"],
    courses["qa-algebra-sprint"],
  ];

  const inProgressLessons = lessonsByCourseSlug["qa-physics-foundations"];
  const completedLessons = lessonsByCourseSlug["qa-data-visualization"];

  await Enrollment.insertMany([
    {
      studentId: profiles.student._id,
      courseId: inProgressCourse._id,
      progress: 33,
      completed: false,
    },
    {
      studentId: profiles.student._id,
      courseId: completedCourse._id,
      progress: 100,
      completed: true,
    },
  ]);

  await LessonProgress.insertMany([
    {
      studentId: profiles.student._id,
      courseId: inProgressCourse._id,
      lessonId: inProgressLessons[0]._id,
    },
    ...completedLessons.map((lesson) => ({
      studentId: profiles.student._id,
      courseId: completedCourse._id,
      lessonId: lesson._id,
    })),
  ]);

  await Cart.create({
    user: users.student._id,
    items: [{ course: cartCourse._id, quantity: 1 }],
  });

  await Wishlist.create({
    userId: users.student._id,
    courseIds: wishlistCourses.map((course) => course._id),
  });

  const completedOrderItems = [inProgressCourse, completedCourse].map((course) => ({
    courseId: course._id,
    title: course.title,
    price: course.salePrice ?? course.price,
    quantity: 1,
  }));

  const expiredOrderItems = [
    {
      courseId: expiredOrderCourse._id,
      title: expiredOrderCourse.title,
      price: expiredOrderCourse.salePrice ?? expiredOrderCourse.price,
      quantity: 1,
    },
  ];

  await Order.create({
    orderCode: "EDQACOMPLETE",
    userId: users.student._id,
    items: completedOrderItems,
    itemsSignature: buildOrderItemsSignature(completedOrderItems),
    totalAmount: completedOrderItems.reduce((sum, item) => sum + item.price, 0),
    status: "paid",
    paidAt: new Date("2026-04-03T09:00:00Z"),
    sepayTransactionId: "QA-TXN-COMPLETE",
    fulfillmentStatus: "completed",
    fulfilledAt: new Date("2026-04-03T09:02:00Z"),
    expiredAt: new Date("2026-04-03T09:30:00Z"),
  });

  await Order.create({
    orderCode: "EDQAEXPIRED",
    userId: users.student._id,
    items: expiredOrderItems,
    itemsSignature: buildOrderItemsSignature(expiredOrderItems),
    totalAmount: expiredOrderItems.reduce((sum, item) => sum + item.price, 0),
    status: "expired",
    fulfillmentStatus: "pending",
    expiredAt: new Date("2026-04-03T11:00:00Z"),
  });

  await Review.insertMany([
    {
      studentId: profiles.student._id,
      courseId: inProgressCourse._id,
      rating: 5,
      comment: "Useful seeded feedback for QA detail surfaces.",
    },
    {
      studentId: profiles.student._id,
      courseId: completedCourse._id,
      rating: 4,
      comment: "Completed review fixture for manual QA.",
    },
  ]);

  await LessonNotebook.insertMany([
    {
      studentId: profiles.student._id,
      courseId: inProgressCourse._id,
      lessonId: inProgressLessons[1]._id,
      note: "Remember to revisit the force examples before the next study session.",
      isBookmarked: true,
    },
    {
      studentId: profiles.student._id,
      courseId: completedCourse._id,
      lessonId: completedLessons[1]._id,
      note: "Strong storytelling checklist. Reuse this structure for reporting tasks.",
      isBookmarked: true,
    },
  ]);

  return {
    wishlistCourses,
    cartCourse,
    inProgressCourse,
    completedCourse,
    expiredOrderCourse,
  };
};

const createInstructorOpsFixtures = async ({ users, profiles }) => {
  const instructorAccount = await InstructorPayoutAccount.create({
    instructorId: profiles.instructor._id,
    bankName: "MBBank",
    accountNumber: "9704220001119999",
    accountHolderName: "QA INSTRUCTOR",
    branch: "Ho Chi Minh City",
    transferNote: "EduScience payout",
    isVerified: true,
  });

  const instructorAltAccount = await InstructorPayoutAccount.create({
    instructorId: profiles.instructorAlt._id,
    bankName: "Vietcombank",
    accountNumber: "0011002233445",
    accountHolderName: "QA INSTRUCTOR ALT",
    branch: "Ha Noi",
    transferNote: "Alt payout account",
    isVerified: true,
  });

  const payoutRequests = await PayoutRequest.insertMany([
    {
      payoutCode: "PAYOUT-QA-PENDING",
      instructorId: profiles.instructor._id,
      payoutAccountId: instructorAccount._id,
      accountSnapshot: {
        bankName: instructorAccount.bankName,
        accountNumber: instructorAccount.accountNumber,
        accountHolderName: instructorAccount.accountHolderName,
        branch: instructorAccount.branch,
        transferNote: instructorAccount.transferNote,
      },
      amount: 120000,
      status: "pending",
      requestedNote: "Please settle this week.",
      requestedAt: new Date("2026-04-03T08:00:00Z"),
    },
    {
      payoutCode: "PAYOUT-QA-PAID",
      instructorId: profiles.instructor._id,
      payoutAccountId: instructorAccount._id,
      accountSnapshot: {
        bankName: instructorAccount.bankName,
        accountNumber: instructorAccount.accountNumber,
        accountHolderName: instructorAccount.accountHolderName,
        branch: instructorAccount.branch,
        transferNote: instructorAccount.transferNote,
      },
      amount: 85000,
      status: "paid",
      requestedNote: "Seeded paid payout for admin history.",
      reviewedNote: "Transferred manually by QA admin.",
      transferReference: "MB-QA-9988",
      requestedAt: new Date("2026-04-01T06:00:00Z"),
      processedAt: new Date("2026-04-01T09:30:00Z"),
      processedByUserId: users.admin._id,
    },
    {
      payoutCode: "PAYOUT-QA-PROCESSING",
      instructorId: profiles.instructorAlt._id,
      payoutAccountId: instructorAltAccount._id,
      accountSnapshot: {
        bankName: instructorAltAccount.bankName,
        accountNumber: instructorAltAccount.accountNumber,
        accountHolderName: instructorAltAccount.accountHolderName,
        branch: instructorAltAccount.branch,
        transferNote: instructorAltAccount.transferNote,
      },
      amount: 54000,
      status: "processing",
      requestedNote: "Awaiting finance confirmation.",
      reviewedNote: "Queued for same-day transfer.",
      requestedAt: new Date("2026-04-04T02:00:00Z"),
      processedByUserId: users.admin._id,
    },
  ]);

  return {
    payoutAccounts: {
      instructor: instructorAccount,
      instructorAlt: instructorAltAccount,
    },
    payoutRequests,
  };
};

const createLessonDiscussionFixtures = async ({
  users,
  profiles,
  courses,
  lessonsByCourseSlug,
}) => {
  const physicsIntroLesson = lessonsByCourseSlug["qa-physics-foundations"][0];
  const dataLesson = lessonsByCourseSlug["qa-data-visualization"][1];

  const comments = await LessonComment.insertMany([
    {
      lessonId: physicsIntroLesson._id,
      courseId: courses["qa-physics-foundations"]._id,
      authorUserId: users.student._id,
      authorRole: "student",
      authorDisplayName: profiles.student.fullName,
      authorAvatarUrl: users.student.avatarUrl,
      body: "I like how this lesson frames the roadmap. Is there a worksheet for the force examples?",
      createdAt: new Date("2026-04-04T01:00:00Z"),
      updatedAt: new Date("2026-04-04T01:00:00Z"),
    },
    {
      lessonId: physicsIntroLesson._id,
      courseId: courses["qa-physics-foundations"]._id,
      authorUserId: users.instructor._id,
      authorRole: "instructor",
      authorDisplayName: profiles.instructor.name,
      authorAvatarUrl: users.instructor.avatarUrl,
      body: "Yes. The worksheet is linked in resources and we will use it again in the Newtonian Motion lesson.",
      createdAt: new Date("2026-04-04T01:30:00Z"),
      updatedAt: new Date("2026-04-04T01:30:00Z"),
    },
    {
      lessonId: dataLesson._id,
      courseId: courses["qa-data-visualization"]._id,
      authorUserId: users.student._id,
      authorRole: "student",
      authorDisplayName: profiles.student.fullName,
      authorAvatarUrl: users.student.avatarUrl,
      body: "The dashboard storytelling checklist is useful. I used it in a team review right away.",
      createdAt: new Date("2026-04-03T05:30:00Z"),
      updatedAt: new Date("2026-04-03T05:30:00Z"),
    },
  ]);

  return comments;
};

export const seedQaData = async () => {
  await cleanupExistingQaData();
  const mediaStrategy = getSeedMediaStrategy();

  const { users, profiles } = await createUserFixtures();
  const { courses, lessonsByCourseSlug, uploadedMedia } = await createCourseFixtures({ profiles });
  const studentFixtures = await createStudentFixtures({
    users,
    profiles,
    courses,
    lessonsByCourseSlug,
  });
  const instructorOps = await createInstructorOpsFixtures({ users, profiles });
  const lessonComments = await createLessonDiscussionFixtures({
    users,
    profiles,
    courses,
    lessonsByCourseSlug,
  });

  return {
    accounts: {
      student: {
        username: QA_ACCOUNTS.student.username,
        password: QA_PASSWORD,
      },
      instructor: {
        username: QA_ACCOUNTS.instructor.username,
        password: QA_PASSWORD,
      },
      admin: {
        username: QA_ACCOUNTS.admin.username,
        password: QA_PASSWORD,
      },
      instructorAlt: {
        username: QA_ACCOUNTS.instructorAlt.username,
        password: QA_PASSWORD,
      },
    },
    userIds: {
      student: users.student._id.toString(),
      instructor: users.instructor._id.toString(),
      instructorAlt: users.instructorAlt._id.toString(),
      admin: users.admin._id.toString(),
    },
    profileIds: {
      student: profiles.student._id.toString(),
      instructor: profiles.instructor._id.toString(),
      instructorAlt: profiles.instructorAlt._id.toString(),
      admin: profiles.admin._id.toString(),
    },
    courses: {
      publicSlugs: QA_PUBLIC_COURSES,
      checkoutCandidate: {
        id: studentFixtures.cartCourse._id.toString(),
        slug: studentFixtures.cartCourse.slug,
      },
      inProgress: {
        id: studentFixtures.inProgressCourse._id.toString(),
        slug: studentFixtures.inProgressCourse.slug,
      },
      completed: {
        id: studentFixtures.completedCourse._id.toString(),
        slug: studentFixtures.completedCourse.slug,
      },
      draft: {
        id: courses["qa-course-publishing-sandbox"]._id.toString(),
        slug: courses["qa-course-publishing-sandbox"].slug,
      },
      archived: {
        id: courses["qa-archived-legacy-course"]._id.toString(),
        slug: courses["qa-archived-legacy-course"].slug,
      },
    },
    payouts: {
      accountIds: {
        instructor: instructorOps.payoutAccounts.instructor._id.toString(),
        instructorAlt: instructorOps.payoutAccounts.instructorAlt._id.toString(),
      },
      requestIds: instructorOps.payoutRequests.map((request) =>
        request._id.toString(),
      ),
    },
    lessonComments: {
      count: lessonComments.length,
    },
    media: {
      strategy: mediaStrategy.uploadsToR2 ? "cloudflare-r2" : "remote-fallback",
      videoSources: mediaStrategy.videoSources,
      uploadedCourses: uploadedMedia,
    },
  };
};
