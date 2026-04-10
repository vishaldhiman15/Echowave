import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 4000;

console.log("Starting server...");
console.log(`MongoDB URI: ${process.env.MONGODB_URI ? "Loaded" : "MISSING"}`);
console.log(`JWT Secret: ${process.env.JWT_SECRET ? "Loaded" : "MISSING"}`);

const start = async () => {
  const HOST = process.env.HOST || '0.0.0.0';
  app.listen(PORT, HOST, () => {
    console.log(`EchoWave server running on port ${PORT} at ${HOST}`);
  });
  await connectDB();
};

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
