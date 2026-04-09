import app from "./app.js";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

console.log("Starting server...");

dotenv.config();

const PORT = process.env.PORT || 4000;

console.log(`MongoDB URI: ${process.env.MONGODB_URI ? 'Loaded' : 'MISSING'}`);
console.log(`JWT Secret: ${process.env.JWT_SECRET ? 'Loaded' : 'MISSING'}`);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`EchoWave server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
