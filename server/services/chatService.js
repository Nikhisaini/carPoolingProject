import mongoose from "mongoose";
import UserFollow from "../model/userFollow.js";
import ConversationParticipant from "../model/conversationParticipant.js";
import Conversation from "../model/conversation.js";
import Message from "../model/message.js";

const checkMutualFollow = async (userId, otherUserId) => {
  const [userFollowOther, otherFollowUser] = await Promise.all([
    UserFollow.exists({
      followerId: userId,
      followingId: otherUserId,
    }),
    UserFollow.exists({
      followerId: otherUserId,
      followingId: userId,
    }),
  ]);
  return Boolean(userFollowOther && otherFollowUser);
};

const getOrCreateConversation = async (userId, otherUserId) => {
  if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
    throw new Error("Invalid user ID");
  }

  if (userId.toString() === otherUserId.toString()) {
    throw new Error("You cannot start a conversation with yourself");
  }

  const canChat = await checkMutualFollow(userId, otherUserId);

  if (!canChat) {
    throw new Error(
      "You can only chat with users who mutually follow each other",
    );
  }

  const participants = await ConversationParticipant.find({
    userId: {
      $in: [userId, otherUserId],
    },
  }).select("conversationId userId");

  const conversationMap = new Map();

  for (const participant of participants) {
    const conversationId = participant.conversationId.toString();

    if (!conversationMap.has(conversationId)) {
      conversationMap.set(conversationId, new Set());
    }

    conversationMap.get(conversationId).add(participant.userId.toString());
  }

  for (const [conversationId, users] of conversationMap.entries()) {
    if (
      users.has(userId.toString()) &&
      users.has(otherUserId.toString()) &&
      users.size === 2
    ) {
      return await Conversation.findById(conversationId);
    }
  }

  const session = await mongoose.startSession();

  try {
    let conversation;
    await session.withTransaction(async () => {
      const conversations = await Conversation.create(
        [
          {
            lastMessageId: null,
            lastMessageAt: null,
          },
        ],
        { session },
      );

      conversation = conversations[0];

      await ConversationParticipant.create(
        [
          {
            conversationId: conversation._id,
            userId,
          },
          {
            conversationId: conversation._id,
            userId: otherUserId,
          },
        ],
        { session },
      );
    });

    return conversation;
  } finally {
    await session.endSession();
  }
};

const sendMessage = async (userId, conversationId, messageText) => {
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw new Error("Invalid conversation ID");
  }

  const message = messageText?.trim();

  if (!message) {
    throw new Error("Message cannot be empty");
  }

  const participant = await ConversationParticipant.findOne({
    conversationId,
    userId,
  });

  if (!participant) {
    throw new Error("You are not a participant in this conversation");
  }

  const session = await mongoose.startSession();

  try {
    let savedMessage;

    await session.withTransaction(async () => {
      const message = await Message.create(
        [
          {
            conversationId,
            senderId: userId,
            message,
          },
        ],
        { session },
      );

      savedMessage = message[0];

      await Conversation.findByIdAndUpdate(
        conversationId,
        {
          lastMessageId: savedMessage._id,
          lastMessageAt: savedMessage.createdAt,
        },
        { session },
      );
    });

    return Message.findById(savedMessage._id).populate(
      "senderId",
      "firstName lastName profileImage",
    );
  } finally {
    await session.endSession();
  }
};

const getConversationMessages = async (
  userId,
  conversationId,
  page = 1,
  limit = 30,
) => {
  const participant = await ConversationParticipant.findOne({
    conversationId,
    userId,
  });
  if (!participant) {
    throw new Error("You are not a participant in this conversation");
  }

  const skip = (page - 1) * limit;

  const messages = await Message.find({
    conversationId,
  })
    .populate("senderId", "firstName lastName profileImage")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return messages.reverse();
};

const markConversationAsRead = async (userId, conversationId) => {
  const prticipant = await ConversationParticipant.findByIdAndUpdate(
    {
      conversationId,
      userId,
    },
    {
      lastReadAt: new Date(),
    },
    {
      new: true,
    },
  );
  if (!participant) {
    throw new Error("COnversation not found");
  }
  return participant;
};

export {
  checkMutualFollow,
  getOrCreateConversation,
  sendMessage,
  getConversationMessages,
  markConversationAsRead,
};
