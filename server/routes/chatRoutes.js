import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { canChat, createConversation } from "../controller/chatController.js";

const router = express.Router();

router.get("/can-chat/:userId", authMiddleware, canChat);
router.post("/conversation", authMiddleware, createConversation);
router.post("/message", authMiddleware, sendChatMessage);

router.get("/messages/:conversationId", authMiddleware, getMessages);

router.put("/messages/:conversationId/read", authMiddleware, markAsRead);
export default router;
