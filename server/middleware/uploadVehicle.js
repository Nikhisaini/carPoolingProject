import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = "uploads/vehicle";

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname).toLowerCase();

    cb(null, uniqueName);
  },
});

const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
];

const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(extension)) {
    return cb(
      new Error("Only JPG, JPEG, PNG, WEBP and AVIF image files are allowed."),
    );
  }

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Invalid image file."));
  }

  cb(null, true);
};

const uploadVehicle = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per image
    files: 10, // Maximum 10 images
  },
});

export default uploadVehicle;
