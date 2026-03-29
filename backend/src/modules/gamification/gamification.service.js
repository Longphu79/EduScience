import StudentGamification from "./studentGamification.model.js";
import Badge from "./badge.model.js";
import GamificationEvent from "./gamificationEvent.model.js";
import Enrollment from "../enrollment/enrollment.model.js";
import QuizAttempt from "../quiz/quizAttempt.model.js";
import AssignmentSubmission from "../assignment/assignmentSubmission.model.js";
import Certificate from "../certificate/certificate.model.js";

function calculateLevel(xp = 0) {
  return Math.max(1, Math.floor(Math.sqrt(Number(xp || 0) / 50)) + 1);
}

async function getOrCreateStudentGamification(studentId) {
  let record = await StudentGamification.findOne({ studentId });

  if (!record) {
    record = await StudentGamification.create({
      studentId,
      xp: 0,
      level: 1,
      currentStreak: 0,
      bestStreak: 0,
      badgeIds: [],
      lastXpUpdateAt: null,
    });
  }

  return record;
}

async function ensureDefaultBadges() {
  const defaults = [
    {
      code: "FIRST_COURSE",
      title: "First Course",
      description: "Complete your first course",
      icon: "🎓",
      ruleType: "complete_courses",
      ruleValue: 1,
    },
    {
      code: "COURSE_FINISHER_5",
      title: "Course Finisher 5",
      description: "Complete 5 courses",
      icon: "🏅",
      ruleType: "complete_courses",
      ruleValue: 5,
    },
    {
      code: "QUIZ_MASTER",
      title: "Quiz Master",
      description: "Reach average quiz score of 90",
      icon: "🧠",
      ruleType: "quiz_score",
      ruleValue: 90,
    },
    {
      code: "STREAK_7",
      title: "7-Day Streak",
      description: "Maintain a 7-day streak",
      icon: "🔥",
      ruleType: "streak_days",
      ruleValue: 7,
    },
    {
      code: "STREAK_30",
      title: "30-Day Streak",
      description: "Maintain a 30-day streak",
      icon: "⚡",
      ruleType: "streak_days",
      ruleValue: 30,
    },
    {
      code: "ASSIGNMENT_WARRIOR",
      title: "Assignment Warrior",
      description: "Submit 10 assignments",
      icon: "📝",
      ruleType: "assignment_count",
      ruleValue: 10,
    },
    {
      code: "CERTIFIED_LEARNER",
      title: "Certified Learner",
      description: "Earn your first certificate",
      icon: "📜",
      ruleType: "certificate_count",
      ruleValue: 1,
    },
  ];

  await Promise.all(
    defaults.map((item) =>
      Badge.findOneAndUpdate(
        { code: item.code },
        { $setOnInsert: item },
        { new: true, upsert: true }
      )
    )
  );
}

async function getStudentStats(studentId) {
  const [enrollments, attempts, submissions, certificates] = await Promise.all([
    Enrollment.find({ studentId }).lean(),
    QuizAttempt.find({ studentId }).lean(),
    AssignmentSubmission.find({ studentId }).lean(),
    Certificate.find({ studentId }).lean(),
  ]);

  const completedCourses = enrollments.filter((item) => item.completed).length;

  const avgQuizScore = attempts.length
    ? Math.round(
        attempts.reduce((sum, item) => sum + Number(item.score || 0), 0) /
          attempts.length
      )
    : 0;

  const activityDates = [
    ...enrollments.map((item) => item.updatedAt || item.createdAt),
    ...attempts.map((item) => item.submittedAt || item.createdAt),
    ...submissions.map((item) => item.submittedAt || item.createdAt),
    ...certificates.map((item) => item.issuedAt || item.createdAt),
  ]
    .filter(Boolean)
    .map((item) => new Date(item).toDateString());

  const uniqueDays = [...new Set(activityDates)].sort(
    (a, b) => new Date(a) - new Date(b)
  );

  let bestStreak = 0;
  let temp = 0;

  for (let i = 0; i < uniqueDays.length; i += 1) {
    if (i === 0) {
      temp = 1;
    } else {
      const diff =
        (new Date(uniqueDays[i]) - new Date(uniqueDays[i - 1])) /
        (1000 * 60 * 60 * 24);

      if (diff === 1) temp += 1;
      else temp = 1;
    }

    if (temp > bestStreak) {
      bestStreak = temp;
    }
  }

  let currentStreak = 0;
  if (uniqueDays.length) {
    currentStreak = 1;
    for (let i = uniqueDays.length - 1; i > 0; i -= 1) {
      const diff =
        (new Date(uniqueDays[i]) - new Date(uniqueDays[i - 1])) /
        (1000 * 60 * 60 * 24);

      if (diff === 1) currentStreak += 1;
      else break;
    }
  }

  return {
    completedCourses,
    avgQuizScore,
    assignmentCount: submissions.length,
    certificateCount: certificates.length,
    currentStreak,
    bestStreak,
  };
}

async function syncBadges(studentId) {
  await ensureDefaultBadges();

  const gamification = await getOrCreateStudentGamification(studentId);
  const stats = await getStudentStats(studentId);
  const badges = await Badge.find({ isActive: true }).lean();

  const ownedBadgeIds = new Set(
    (gamification.badgeIds || []).map((item) => String(item))
  );

  const newBadgeIds = [];

  for (const badge of badges) {
    let matched = false;

    if (
      badge.ruleType === "complete_courses" &&
      stats.completedCourses >= Number(badge.ruleValue || 0)
    ) {
      matched = true;
    }

    if (
      badge.ruleType === "quiz_score" &&
      stats.avgQuizScore >= Number(badge.ruleValue || 0)
    ) {
      matched = true;
    }

    if (
      badge.ruleType === "streak_days" &&
      stats.bestStreak >= Number(badge.ruleValue || 0)
    ) {
      matched = true;
    }

    if (
      badge.ruleType === "assignment_count" &&
      stats.assignmentCount >= Number(badge.ruleValue || 0)
    ) {
      matched = true;
    }

    if (
      badge.ruleType === "certificate_count" &&
      stats.certificateCount >= Number(badge.ruleValue || 0)
    ) {
      matched = true;
    }

    if (matched && !ownedBadgeIds.has(String(badge._id))) {
      newBadgeIds.push(badge._id);
    }
  }

  if (newBadgeIds.length) {
    gamification.badgeIds = [...(gamification.badgeIds || []), ...newBadgeIds];
  }

  gamification.currentStreak = stats.currentStreak;
  gamification.bestStreak = Math.max(
    Number(gamification.bestStreak || 0),
    Number(stats.bestStreak || 0)
  );

  await gamification.save();

  return gamification.populate("badgeIds");
}

export async function awardXp({
  studentId,
  type,
  xpEarned,
  sourceId = null,
  sourceType = "",
  meta = null,
}) {
  if (!studentId || !type) {
    throw new Error("studentId and type are required");
  }

  const safeXp = Math.max(0, Number(xpEarned || 0));

  const gamification = await getOrCreateStudentGamification(studentId);

  await GamificationEvent.create({
    studentId,
    type,
    xpEarned: safeXp,
    sourceId,
    sourceType,
    meta,
    createdAt: new Date(),
  });

  gamification.xp = Number(gamification.xp || 0) + safeXp;
  gamification.level = calculateLevel(gamification.xp);
  gamification.lastXpUpdateAt = new Date();
  await gamification.save();

  return syncBadges(studentId);
}

export async function getStudentGamification(studentId) {
  if (!studentId) {
    throw new Error("studentId is required");
  }

  await ensureDefaultBadges();

  const gamification = await syncBadges(studentId);

  const populated = await StudentGamification.findOne({ studentId })
    .populate("badgeIds")
    .lean();

  return populated || gamification;
}

export async function getStudentGamificationEvents(studentId, limit = 20) {
  if (!studentId) {
    throw new Error("studentId is required");
  }

  const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 100));

  return GamificationEvent.find({ studentId })
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean();
}

export async function getStudentBadges(studentId) {
  const gamification = await getStudentGamification(studentId);
  return Array.isArray(gamification?.badgeIds) ? gamification.badgeIds : [];
}

export const XP_RULES = {
  COMPLETE_LESSON: 10,
  PASS_QUIZ: 20,
  COMPLETE_ASSIGNMENT: 25,
  COMPLETE_COURSE: 100,
  EARN_CERTIFICATE: 150,
};