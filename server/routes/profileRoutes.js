import express from "express";
import {
  deleteProfile,
  getProfile,
  updateProfile,
} from "../controller/profileController.js";
import uploadProfile from "../middleware/uploadProfile.js";
import authMiddleware from "../middleware/authMiddleware.js";
import multerErrorHandler from "../middleware/multerErrorHandler.js";

const router = express.Router();

router.get("/", authMiddleware, getProfile);
router.put(
  "/update",
  authMiddleware,
  uploadProfile.single("profileImage"),
  multerErrorHandler,
  updateProfile,
);
router.delete("/delete", authMiddleware, deleteProfile);

export default router;
