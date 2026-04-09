import express from "express";
import { getPlaylist, listPlaylists, createPlaylist } from "../controllers/playlistsController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", listPlaylists);
router.post("/", requireAuth, createPlaylist);
router.get("/:id", getPlaylist);

export default router;
