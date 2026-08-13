import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createReview,
  getBookingReviewStatus,
  getUserReviews,
} from "../controller/reviewController.js";

const router = express.Router();

router.post("/create", authMiddleware, createReview);
router.get("/user/:userId", getUserReviews);
router.get(
  "/booking/:bookingId/status",
  authMiddleware,
  getBookingReviewStatus,
);

export default router;
