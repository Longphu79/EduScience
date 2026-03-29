import "dotenv/config";
import mongoose from "mongoose";
import Badge from "./badge.model.js";

const MONGO_URI = process.env.MONGO_URI;

const badges = [
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

async function run() {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    for (const badge of badges) {
      await Badge.findOneAndUpdate(
        { code: badge.code },
        { $setOnInsert: badge },
        { upsert: true, new: true }
      );
    }

    console.log("Badges seeded successfully");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seed badges failed:", error.message);
    try {
      await mongoose.disconnect();
    } catch {}
    process.exit(1);
  }
}

run();