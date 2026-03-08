import express from "express";
import cors from "cors";
import authRoute from "./routes/auth.route.js";
import courseRoute from "./routes/course.route.js";
import userRoute from "./routes/user.route.js";
import cartRoutes from "./routes/cart.route.js";
import enrollmentRoute from "./routes/enrollment.route.js";
import dotenv from "dotenv";
import { connectDatabase } from "./config/Database.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

connectDatabase();

// routes
app.use("/auth", authRoute);
app.use("/course", courseRoute);
app.use("/user", userRoute);
app.use("/api/cart", cartRoutes);
app.use("/enrollment", enrollmentRoute);

// test route
app.get("/", (req, res) => {
  res.send("Server is running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

export default app;