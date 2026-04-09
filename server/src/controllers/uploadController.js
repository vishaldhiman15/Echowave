import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const isRealEnvValue = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return false;
  const lower = raw.toLowerCase();
  if (lower === "your_cloud_name") return false;
  if (lower === "your_api_key") return false;
  if (lower === "your_api_secret") return false;
  if (lower.startsWith("your_")) return false;
  if (lower.includes("change_this")) return false;
  return true;
};

const isCloudinaryConfigured =
  isRealEnvValue(process.env.CLOUDINARY_CLOUD_NAME) &&
  isRealEnvValue(process.env.CLOUDINARY_API_KEY) &&
  isRealEnvValue(process.env.CLOUDINARY_API_SECRET);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.resolve(__dirname, "../../uploads");
const imageUploadDir = path.join(uploadsRoot, "images");
const audioUploadDir = path.join(uploadsRoot, "audio");

const ensureDir = (dirPath) => {
  try {
    fs.mkdirSync(dirPath, { recursive: true });
  } catch {
    // best-effort
  }
};

ensureDir(imageUploadDir);
ensureDir(audioUploadDir);

const safeExt = (originalName) => {
  const ext = path.extname(originalName || "").toLowerCase();
  if (!ext) return "";
  if (ext.length > 10) return "";
  return ext;
};

const makeFilename = (prefix, originalName) => {
  const ext = safeExt(originalName);
  return `${prefix}_${Date.now()}_${crypto.randomUUID()}${ext}`;
};

const localImageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, imageUploadDir),
  filename: (_req, file, cb) => cb(null, makeFilename("img", file.originalname)),
});

const localAudioStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, audioUploadDir),
  filename: (_req, file, cb) => cb(null, makeFilename("aud", file.originalname)),
});

const imageStorage = isCloudinaryConfigured
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder: "echowave/images",
        resource_type: "image",
      },
    })
  : localImageStorage;

const audioStorage = isCloudinaryConfigured
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder: "echowave/audio",
        resource_type: "video",
      },
    })
  : localAudioStorage;

export const imageUpload = multer({ storage: imageStorage });
export const audioUpload = multer({ storage: audioStorage });

const resolveFileUrl = (req) => {
  const rawPath = req.file?.path;
  if (typeof rawPath === "string" && rawPath.startsWith("http")) {
    return rawPath;
  }

  const filePath = req.file?.path;
  if (!filePath) return "";

  const relative = path
    .relative(uploadsRoot, filePath)
    .split(path.sep)
    .join("/");

  return `${req.protocol}://${req.get("host")}/uploads/${relative}`;
};

export const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Missing file" });
  }
  return res.json({
    url: resolveFileUrl(req),
    publicId: req.file.filename,
  });
};

export const uploadAudio = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Missing file" });
  }
  return res.json({
    url: resolveFileUrl(req),
    publicId: req.file.filename,
  });
};
