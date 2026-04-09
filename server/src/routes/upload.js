import express from "express";
import {
  audioUpload,
  imageUpload,
  uploadAudio,
  uploadImage,
} from "../controllers/uploadController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/image", requireAuth, imageUpload.single("file"), uploadImage);
router.post("/audio", requireAuth, audioUpload.single("file"), uploadAudio);

export default router;
