import express from "express";
import {
  retryPayment,
  verifyPayment,
} from "../controller/paymentController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/verify", authMiddleware, verifyPayment);
router.post("/retry", authMiddleware, retryPayment);
export default router;
