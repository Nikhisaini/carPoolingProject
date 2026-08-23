import mongoose from "mongoose";
import {
  canChatWithUser,
  getConversationById,
  getConversationMessages,
  getOrCreateConversation,
  getUserConversations,
  getUnreadMessageCount,
  markConversationAsRead,
  sendMessage,
} from "../services/chatService.js";
import { getIO } from "../socket/socketServer.js";
import ConversationParticipant from "../model/conversationParticipant.js";

const canChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const { userId: otherUserId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({
        success: false,
        canChat: false,
        message: "Invalid user ID",
      });
    }

    if (userId.toString() === otherUserId.toString()) {
      return res.status(400).json({
        success: false,
        canChat: false,
        message: "You cannot chat with yourself",
      });
    }

    const allowed = await canChatWithUser(userId, otherUserId);

    return res.status(200).json({
      success: true,
      canChat: allowed,
    });
  } catch (error) {
    console.error("Can Chat Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to check chat permission",
    });
  }
};

const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await getUserConversations(userId);

    return res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("Get Conversations Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load conversations",
    });
  }
};

const getConversationDetail = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    const conversation = await getConversationById(userId, conversationId);

    return res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error("Get Conversation Detail Error:", error);

    if (
      error.message === "Invalid conversation ID" ||
      error.message === "You are not a participant in this conversation" ||
      error.message === "Conversation not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to load conversation details",
    });
  }
};

const createConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { userId: otherUserId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const conversation = await getOrCreateConversation(userId, otherUserId);

    return res.status(200).json({
      success: true,
      message: "Conversation ready",
      data: conversation,
    });
  } catch (error) {
    console.error("Create Conversation Error:", error);

    if (
      error.message === "Invalid user ID" ||
      error.message === "You cannot start a conversation with yourself"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(403).json({
      success: false,
      message: error.message || "Failed to create conversation",
    });
  }
};

const sendChatMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId, message } = req.body;

    if (!conversationId || !message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID and message are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    const savedMessage = await sendMessage(userId, conversationId, message);

    try {
      const io = getIO();
      io.to(`conversation:${conversationId}`).emit(
        "chat:message",
        savedMessage,
      );

      const participants = await ConversationParticipant.find({
        conversationId,
      }).select("userId");

      for (const participant of participants) {
        const participantId = participant.userId.toString();
        if (participantId !== userId.toString()) {
          io.to(`user:${participantId}`).emit("chat:message:new", savedMessage);
        }
      }
    } catch (socketErr) {
      console.warn(
        "Socket broadcast error in sendChatMessage:",
        socketErr.message,
      );
    }

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: savedMessage,
    });
  } catch (error) {
    console.error("Sent Chat Message Error:", error);

    if (
      error.message === "Invalid conversation ID" ||
      error.message === "Message cannot be empty"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "You are not a participant in this conversation") {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};

const getMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 30;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    const messages = await getConversationMessages(
      userId,
      conversationId,
      page,
      limit,
    );

    return res.status(200).json({
      success: true,
      data: messages,
      pagination: {
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Get Message Error:", error);

    if (error.message === "You are not a participant in this conversation") {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to get messages",
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    await markConversationAsRead(userId, conversationId);

    return res.status(200).json({
      success: true,
      message: "Conversation marked as read",
    });
  } catch (error) {
    console.error("Mark Read Error:", error);

    if (error.message === "Conversation not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to mark conversation as read",
    });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await getUnreadMessageCount(userId);

    return res.status(200).json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    console.error("Get Unread Count Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get unread message count",
    });
  }
};

export {
  canChat,
  getConversations,
  getConversationDetail,
  createConversation,
  sendChatMessage,
  getMessage,
  markAsRead,
  getUnreadCount,
};
