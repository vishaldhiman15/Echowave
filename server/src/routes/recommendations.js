import express from "express";
import { getRecommendations } from "../controllers/recommendationsController.js";
import { optionalAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", optionalAuth, getRecommendations);

export default router;
