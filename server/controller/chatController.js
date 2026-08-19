import {
  checkMutualFollow,
  getOrCreateConversation,
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

export { canChat, createConversation };
