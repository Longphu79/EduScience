import express from "express";
import cors from "cors";
import authRoute from "./routes/auth.route.js";
import courseRoute from "./routes/course.route.js";
import userRoute from "./routes/user.route.js"
import wishlistRoute from "./routes/wishlist.route.js";
import cartRoutes from "./routes/cart.route.js";
import uploadRoute from "./routes/upload.route.js";
import lessonRoute from "./routes/lesson.route.js";
import checkoutRoute from "./routes/checkout.route.js";
import orderRoute from "./routes/order.route.js";
import webhookRoute from "./routes/webhook.route.js";
import dotenv from 'dotenv';
import { connectDatabase } from './config/Database.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
connectDatabase();

// routes
app.use("/auth", authRoute);
app.use("/course", courseRoute);
app.use("/user", userRoute );
app.use("/wishlist", wishlistRoute);
app.use("/api/cart", cartRoutes);
app.use("/api/upload", uploadRoute);
app.use("/api/lesson", lessonRoute);
app.use("/api/checkout", checkoutRoute);
app.use("/api/order", orderRoute);
app.use("/api/webhook", webhookRoute);

// test route
app.get('/', (req, res) => {
  res.send('Server is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

export default app;
