import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import artistsRoutes from "./routes/artists.js";
import albumsRoutes from "./routes/albums.js";
import tracksRoutes from "./routes/tracks.js";
import playlistsRoutes from "./routes/playlists.js";
import uploadRoutes from "./routes/upload.js";
import searchRoutes from "./routes/search.js";
import recommendationsRoutes from "./routes/recommendations.js";
import { notFound, errorHandler } from "./middleware/error.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webPath = path.resolve(__dirname, "../../web");
const uploadsPath = path.resolve(__dirname, "../uploads");

app.use(express.static(webPath));
app.use("/uploads", express.static(uploadsPath));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/artists", artistsRoutes);
app.use("/api/albums", albumsRoutes);
app.use("/api/tracks", tracksRoutes);
app.use("/api/playlists", playlistsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/recommendations", recommendationsRoutes);

app.use("/api", notFound);

app.get("*", (req, res) => {
  res.sendFile(path.join(webPath, "index.html"));
});

app.use(errorHandler);

export default app;
