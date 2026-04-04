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
import orderRoute from "./modules/checkout/order.route.js";
import webhookRoute from "./modules/checkout/webhook.route.js";
import checkoutRoute from "./modules/checkout/checkout.route.js";
import walletRoute from "./modules/wallet/wallet.route.js";
import transactionRoute from "./modules/transaction/transaction.route.js";
import gamificationRoute from "./modules/gamification/gamification.route.js";

import { notFoundMiddleware } from "./middlewares/notFound.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { sendSuccess } from "./utils/response.js";

const app = express();

const allowedOrigins = (
    process.env.FRONTEND_URL ||
    "http://localhost:5173" ||
    "https://eduscience.id.vn"
)
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

app.use("/api/auth", authRoute);
app.use("/api/course", courseRoute);
app.use("/api/user", userRoute);
app.use("/api/cart", cartRoute);
app.use("/api/enrollment", enrollmentRoute);
app.use("/api/lesson", lessonRoute);
app.use("/api/material", materialRoute);
app.use("/api/quiz", quizRoute);
app.use("/api/assignment", assignmentRoute);
app.use("/api/review", reviewRoute);
app.use("/api/certificate", certificateRoute);
app.use("/api/chat", chatRoute);
app.use("/api/admin", adminRoute);
app.use("/api/upload", uploadRoute);
app.use("/api/order", orderRoute);
app.use("/api/webhook", webhookRoute);
app.use("/api/checkout", checkoutRoute);
app.use("/api/wallet", walletRoute);
app.use("/api/transaction", transactionRoute);
app.use("/api/gamification", gamificationRoute);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
