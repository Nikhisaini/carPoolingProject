import express from "express";
import {
  follow,
  unfollow,
  getStatus,
  getCount,
} from "../controller/userFollowController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:userId", authMiddleware, follow);
router.delete("/:userId", authMiddleware, unfollow);
router.get("/status/:userId", authMiddleware, getStatus);
router.get("/count/:userId", getCount);

export default router;
