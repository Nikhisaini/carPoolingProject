import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  canChat,
  createConversation,
  getConversationDetail,
  getConversations,
  getMessage,
  getUnreadCount,
  markAsRead,
  sendChatMessage,
} from "../controller/chatController.js";

const router = express.Router();

router.get("/unread-count", authMiddleware, getUnreadCount);
router.get("/conversations", authMiddleware, getConversations);
router.get(
  "/conversations/:conversationId",
  authMiddleware,
  getConversationDetail,
);
router.get("/can-chat/:userId", authMiddleware, canChat);
router.post("/conversation", authMiddleware, createConversation);
router.post("/message", authMiddleware, sendChatMessage);
router.get("/messages/:conversationId", authMiddleware, getMessage);
router.put("/messages/:conversationId/read", authMiddleware, markAsRead);

export default router;
