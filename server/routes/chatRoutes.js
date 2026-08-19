import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { canChat, createConversation } from "../controller/chatController.js";

const router = express.Router();

router.get("/can-chat/:userId", authMiddleware, canChat);
router.post("/conversation", authMiddleware, createConversation);

export default router;
