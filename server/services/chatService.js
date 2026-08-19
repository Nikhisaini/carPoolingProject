import mongoose from "mongoose";
import UserFollow from "../model/userFollow.js";
import ConversationParticipant from "../model/conversationParticipant.js";
import Conversation from "../model/conversation.js";

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

export { checkMutualFollow, getOrCreateConversation };
