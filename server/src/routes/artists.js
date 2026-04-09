import express from "express";
import { getArtist, listArtists } from "../controllers/artistsController.js";

const router = express.Router();

router.get("/", listArtists);
router.get("/:id", getArtist);

export default router;
