import multer from "multer";

// Use memory storage - files stay as Buffers in RAM
const storage = multer.memoryStorage();

// File filter function
const fileFilter: multer.Options['fileFilter'] = (req, file, cb) => {
  // Accept only jpeg, png, and webp
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});