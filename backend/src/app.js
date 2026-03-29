import express from "express";
import cors from "cors";
import path from "path";

import authRoute from "./modules/auth/auth.route.js";
import courseRoute from "./modules/course/course.route.js";
import userRoute from "./modules/user/user.route.js";
import cartRoute from "./modules/cart/cart.route.js";
import enrollmentRoute from "./modules/enrollment/enrollment.route.js";
import lessonRoute from "./modules/lesson/lesson.route.js";
import materialRoute from "./modules/material/material.route.js";
import quizRoute from "./modules/quiz/quiz.route.js";
import assignmentRoute from "./modules/assignment/assignment.route.js";
import reviewRoute from "./modules/review/review.route.js";
import certificateRoute from "./modules/certificate/certificate.route.js";
import chatRoute from "./modules/chat/chat.route.js";
import adminRoute from "./modules/admin/admin.route.js";
import uploadRoute from "./modules/upload/upload.route.js";
import gamificationRoute from "./modules/gamification/gamification.route.js";

import { notFoundMiddleware } from "./middlewares/notFound.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { sendSuccess } from "./utils/response.js";

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.get("/", (_req, res) => {
  return sendSuccess(res, {
    statusCode: 200,
    message: "Server is running",
    data: {
      app: "EduScience backend",
      status: "ok",
    },
  });
});

app.use("/auth", authRoute);
app.use("/course", courseRoute);
app.use("/user", userRoute);
app.use("/api/cart", cartRoute);
app.use("/enrollment", enrollmentRoute);
app.use("/lesson", lessonRoute);
app.use("/material", materialRoute);
app.use("/quiz", quizRoute);
app.use("/assignment", assignmentRoute);
app.use("/review", reviewRoute);
app.use("/certificate", certificateRoute);
app.use("/chat", chatRoute);
app.use("/admin", adminRoute);
app.use("/upload", uploadRoute);
app.use("/gamification", gamificationRoute);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;