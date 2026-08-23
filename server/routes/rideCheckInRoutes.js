import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  markPassengerNoShowed,
  sendCheckInOtp,
  verifyCheckinOtp,
} from "../controller/rideCheckInController.js";

const router = express.Router();

router.post("/send-otp", authMiddleware, sendCheckInOtp);
router.post("/verify-otp", authMiddleware, verifyCheckinOtp);
router.patch("/no-show", authMiddleware, markPassengerNoShowed);

export default router;
