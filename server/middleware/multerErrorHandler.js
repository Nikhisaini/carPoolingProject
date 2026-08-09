import multer from "multer";

const multerErrorHandler = (err, req, res, next) => {
  // Multer errors
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(400).json({
          success: false,
          message: "Image size must not exceed 5 MB.",
        });

      case "LIMIT_FILE_COUNT":
        return res.status(400).json({
          success: false,
          message: "Too many files uploaded.",
        });

      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          success: false,
          message: "Unexpected file field.",
        });

      default:
        return res.status(400).json({
          success: false,
          message: err.message,
        });
    }
  }

  // Custom errors from fileFilter()
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next();
};

export default multerErrorHandler;
