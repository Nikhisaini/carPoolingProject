import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = "uploads/licence";

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
      path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedType = /jpg|jpeg|png|webp/;
  const extName = allowedType.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimeType = allowedType.test(file.mimetype);

  if (extName && mimeType) {
    return cb(null, true);
  }
  cb(new Error("Only JPG, JPEG, PNg and WEBP Image are allowed "));
};
const uploadLicence = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default uploadLicence;
