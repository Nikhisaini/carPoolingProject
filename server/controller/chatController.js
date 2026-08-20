import {
  checkMutualFollow,
  getConversationMessages,
  getOrCreateConversation,
  markConversationAsRead,
  sendMessage,
} from "../services/chatService.js";

const canChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const { userId: otherUserId } = req.params;

    if (userId.toString() === otherUserId.toString()) {
      return res.status(400).json({
        success: false,
        canChat: false,
        message: "You cannot chat with yourself",
      });
    }

    const canChat = await checkMutualFollow(userId, otherUserId);

    return res.status(200).json({
      success: true,
      canChat,
    });
  } catch (error) {
    console.error("Can Chat Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to check chat permission",
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

    if (
      error.message ===
      "You can only chat with users who mutually follow each other"
    ) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create conversation",
    });
  }
};

const sendChatMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId, message } = req.body;
    if (!conversationId || message) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID and message are required",
      });
    }
    const savedMessage = await sendMessage(userId, conversationId, message);

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      message,
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

    if (error.message === "You are not a participent of this conversation") {
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
    const page = Number(req.user.page) || 1;
    const limit = Nuumber(req.user.limit) || 30;

    const message = await getConversationMessages(
      userId,
      conversationId,
      page,
      limit,
    );

    return res.status(200).json({
      success: true,
      data: message,
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
export { canChat, createConversation, sendChatMessage, getMessage, markAsRead };
