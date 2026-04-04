import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDatabase } from "../config/Database.js";
import { seedQaData } from "../qa/seedQaData.js";

dotenv.config();

await connectDatabase();

try {
  const summary = await seedQaData();

  console.log("QA seed completed.");
  console.log(JSON.stringify(summary, null, 2));
} finally {
  await mongoose.disconnect();
}
