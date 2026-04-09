import express from "express";
import {
	createTrack,
	getTrack,
	likeTrack,
	listLikedTracks,
	listMyTracks,
	listTracks,
	unlikeTrack,
} from "../controllers/tracksController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", listTracks);
router.get("/mine", requireAuth, listMyTracks);
router.get("/liked", requireAuth, listLikedTracks);
router.post("/", requireAuth, createTrack);
router.post("/:id/like", requireAuth, likeTrack);
router.delete("/:id/like", requireAuth, unlikeTrack);
router.get("/:id", getTrack);

export default router;
