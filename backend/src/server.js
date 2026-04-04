import dotenv from "dotenv";
import app from "./app.js";
import { connectDatabase } from "./config/Database.js";

dotenv.config();

await connectDatabase();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
