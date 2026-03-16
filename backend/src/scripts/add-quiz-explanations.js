import dotenv from "dotenv";
import { connectDatabase } from "../config/Database.js";
import Quiz from "../models/Quiz.js";

dotenv.config();

function buildExplanation(questionText = "", options = []) {
  const safeQuestion = String(questionText || "").trim();

  const correctOptions = (options || []).filter((opt) => opt?.isCorrect);
  const correctTexts = correctOptions.map((opt) => opt?.text || "").filter(Boolean);

  if (!correctTexts.length) {
    return `The correct answer for "${safeQuestion}" is based on the core concept covered in this lesson. Review the related topic and compare each option carefully to understand why the correct choice fits best.`;
  }

  if (correctTexts.length === 1) {
    return `The correct answer is "${correctTexts[0]}". This matches the main concept tested in the question "${safeQuestion}". Review the lesson content related to this topic to understand why this option is correct and why the other options are not suitable.`;
  }

  return `The correct answers are ${correctTexts
    .map((item) => `"${item}"`)
    .join(", ")}. These choices correctly reflect the concept tested in the question "${safeQuestion}". Revisit the lesson content to understand why these answers are correct and how to eliminate the incorrect options.`;
}

async function run() {
  await connectDatabase();

  const quizzes = await Quiz.find({});
  let updatedQuizCount = 0;
  let updatedQuestionCount = 0;

  for (const quiz of quizzes) {
    let changed = false;

    quiz.questions = (quiz.questions || []).map((question) => {
      const hasExplanation =
        typeof question.explanation === "string" &&
        question.explanation.trim().length > 0;

      if (hasExplanation) return question;

      changed = true;
      updatedQuestionCount += 1;

      question.explanation = buildExplanation(
        question.questionText,
        question.options
      );

      return question;
    });

    if (changed) {
      await quiz.save();
      updatedQuizCount += 1;
      console.log(`✅ Updated explanations for quiz: ${quiz.title}`);
    }
  }

  console.log(`\n🎉 DONE`);
  console.log(`Updated quizzes: ${updatedQuizCount}`);
  console.log(`Updated questions: ${updatedQuestionCount}`);

  process.exit(0);
}

run().catch((error) => {
  console.error("❌ ADD EXPLANATIONS ERROR:", error);
  process.exit(1);
});