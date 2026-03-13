import express from "express";
import cors from "cors";

import authRoute from "./modules/auth/auth.route.js";
import courseRoute from "./modules/course/course.route.js";
import userRoute from "./modules/user/user.route.js";
import cartRoute from "./modules/cart/cart.route.js";
import enrollmentRoute from "./modules/enrollment/enrollment.route.js";
import lessonRoute from "./modules/lesson/lesson.route.js";
import materialRoute from "./modules/material/material.route.js";
import quizRoute from "./modules/quiz/quiz.route.js";
import quizAttemptRoute from "./modules/quiz/quizAttempt.route.js";
import assignmentRoute from "./modules/assignment/assignment.route.js";
import reviewRoute from "./modules/review/review.route.js";
import certificateRoute from "./modules/certificate/certificate.route.js";
import chatRoute from "./modules/chat/chat.route.js";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/auth", authRoute);
app.use("/course", courseRoute);
app.use("/user", userRoute);
app.use("/api/cart", cartRoute);
app.use("/enrollment", enrollmentRoute);
app.use("/lesson", lessonRoute);
app.use("/material", materialRoute);
app.use("/quiz", quizRoute);
app.use("/quiz-attempt", quizAttemptRoute);
app.use("/assignment", assignmentRoute);
app.use("/review", reviewRoute);
app.use("/certificate", certificateRoute);
app.use("/chat", chatRoute);

export default app;