import express from "express";
import { getAlbum, listAlbums } from "../controllers/albumsController.js";

const router = express.Router();

router.get("/", listAlbums);
router.get("/:id", getAlbum);

export default router;
