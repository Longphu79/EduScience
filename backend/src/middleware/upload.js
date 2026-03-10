import multer from "multer";
import path from "path";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const VIDEO_TYPES = ["video/mp4", "video/webm"];

const createUpload = (allowedTypes, maxSize) => {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxSize },
    fileFilter: (_req, file, cb) => {
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type. Allowed: ${allowedTypes.join(", ")}`));
      }
    },
  });
};

export const avatarUpload = createUpload(IMAGE_TYPES, 5 * 1024 * 1024); // 5MB
export const thumbnailUpload = createUpload(IMAGE_TYPES, 10 * 1024 * 1024); // 10MB
export const videoUpload = createUpload(VIDEO_TYPES, 500 * 1024 * 1024); // 500MB
