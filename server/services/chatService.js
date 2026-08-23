import mongoose from "mongoose";
import UserFollow from "../model/userFollow.js";
import ConversationParticipant from "../model/conversationParticipant.js";
import Conversation from "../model/conversation.js";
import Message from "../model/message.js";
import Booking from "../model/bookings.js";
import Ride from "../model/ride.js";

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

const canChatWithUser = async (userId, otherUserId) => {
  // 1. Check mutual follow
  const isMutual = await checkMutualFollow(userId, otherUserId);
  if (isMutual) return true;

  // 2. Check if otherUser is driver and userId has a confirmed/completed booking
  const driverRides = await Ride.find({
    ownerId: otherUserId,
    status: { $in: ["PUBLISHED", "FULL", "STARTED", "COMPLETED"] },
  }).select("_id");

  if (driverRides.length > 0) {
    const rideIds = driverRides.map((r) => r._id);
    const bookingExists = await Booking.exists({
      passengerId: userId,
      rideId: { $in: rideIds },
      status: { $in: ["CONFIRMED", "COMPLETED"] },
    });
    if (bookingExists) return true;
  }

  // 3. Check if userId is driver and otherUser has a confirmed/completed booking
  const myRides = await Ride.find({
    ownerId: userId,
    status: { $in: ["PUBLISHED", "FULL", "STARTED", "COMPLETED"] },
  }).select("_id");

  if (myRides.length > 0) {
    const myRideIds = myRides.map((r) => r._id);
    const bookingExists = await Booking.exists({
      passengerId: otherUserId,
      rideId: { $in: myRideIds },
      status: { $in: ["CONFIRMED", "COMPLETED"] },
    });
    if (bookingExists) return true;
  }

  // 4. Check if otherUser and userId are co-passengers on the same confirmed/completed ride
  const myPassengerBookings = await Booking.find({
    passengerId: userId,
    status: { $in: ["CONFIRMED", "COMPLETED"] },
  }).select("rideId");

  if (myPassengerBookings.length > 0) {
    const myRideIds = myPassengerBookings.map((b) => b.rideId);
    const coPassengerBookingExists = await Booking.exists({
      passengerId: otherUserId,
      rideId: { $in: myRideIds },
      status: { $in: ["CONFIRMED", "COMPLETED"] },
    });
    if (coPassengerBookingExists) return true;
  }

  return false;
};

const getOrCreateConversation = async (userId, otherUserId) => {
  if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
    throw new Error("Invalid user ID");
  }

  if (userId.toString() === otherUserId.toString()) {
    throw new Error("You cannot start a conversation with yourself");
  }

  const canChat = await canChatWithUser(userId, otherUserId);

  if (!canChat) {
    throw new Error(
      "You can only chat with users who share a confirmed ride with you or mutually follow each other.",
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
      const existing = await Conversation.findById(conversationId);
      if (existing) return existing;
    }
  }

  try {
    const session = await mongoose.startSession();

    try {
      let conversation;
      await session.withTransaction(async () => {
        const [conv] = await Conversation.create(
          [
            {
              lastMessageId: null,
              lastMessageAt: null,
            },
          ],
          { session },
        );

        conversation = conv;

        await ConversationParticipant.insertMany(
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
  } catch (error) {
    // Resilient fallback if transactions are not supported or throw
    const conversation = await Conversation.create({
      lastMessageId: null,
      lastMessageAt: null,
    });

    await ConversationParticipant.insertMany([
      {
        conversationId: conversation._id,
        userId,
      },
      {
        conversationId: conversation._id,
        userId: otherUserId,
      },
    ]);

    return conversation;
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

  try {
    const session = await mongoose.startSession();

    try {
      let savedMessage;

      await session.withTransaction(async () => {
        const createdMessages = await Message.create(
          [
            {
              conversationId,
              senderId: userId,
              message,
            },
          ],
          { session },
        );

        savedMessage = createdMessages[0];

        await Conversation.findByIdAndUpdate(
          conversationId,
          {
            lastMessageId: savedMessage._id,
            lastMessageAt: savedMessage.createdAt,
          },
          { session },
        );
      });

      return await Message.findById(savedMessage._id).populate(
        "senderId",
        "firstName lastName profileImage",
      );
    } finally {
      await session.endSession();
    }
  } catch (error) {
    // Resilient fallback
    const savedMessage = await Message.create({
      conversationId,
      senderId: userId,
      message,
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessageId: savedMessage._id,
      lastMessageAt: savedMessage.createdAt,
    });

    return await Message.findById(savedMessage._id).populate(
      "senderId",
      "firstName lastName profileImage",
    );
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
  const participant = await ConversationParticipant.findOneAndUpdate(
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
    throw new Error("Conversation not found");
  }

  return participant;
};

const getUserConversations = async (userId) => {
  const participations = await ConversationParticipant.find({
    userId,
  }).lean();

  if (!participations || participations.length === 0) {
    return [];
  }

  const conversationIds = participations.map((p) => p.conversationId);

  const conversations = await Conversation.find({
    _id: { $in: conversationIds },
  })
    .populate({
      path: "lastMessageId",
      populate: {
        path: "senderId",
        select: "firstName lastName profileImage",
      },
    })
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .lean();

  const allOtherParticipants = await ConversationParticipant.find({
    conversationId: { $in: conversationIds },
    userId: { $ne: userId },
  })
    .populate("userId", "firstName lastName profileImage")
    .lean();

  const otherParticipantMap = new Map();
  for (const part of allOtherParticipants) {
    otherParticipantMap.set(part.conversationId.toString(), part.userId);
  }

  const participationMap = new Map();
  for (const part of participations) {
    participationMap.set(part.conversationId.toString(), part.lastReadAt);
  }

  const formattedList = await Promise.all(
    conversations.map(async (conv) => {
      const convId = conv._id.toString();
      const otherParticipant = otherParticipantMap.get(convId) || null;
      const myLastReadAt = participationMap.get(convId);

      const unreadFilter = {
        conversationId: conv._id,
        senderId: { $ne: userId },
      };
      if (myLastReadAt) {
        unreadFilter.createdAt = { $gt: myLastReadAt };
      }

      const unreadCount = await Message.countDocuments(unreadFilter);

      return {
        _id: conv._id,
        otherParticipant,
        lastMessage: conv.lastMessageId || null,
        lastMessageAt: conv.lastMessageAt || conv.updatedAt,
        unreadCount,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      };
    }),
  );

  return formattedList;
};

const getConversationById = async (userId, conversationId) => {
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw new Error("Invalid conversation ID");
  }

  const myParticipant = await ConversationParticipant.findOne({
    conversationId,
    userId,
  });

  if (!myParticipant) {
    throw new Error("You are not a participant in this conversation");
  }

  const conversation = await Conversation.findById(conversationId)
    .populate({
      path: "lastMessageId",
      populate: {
        path: "senderId",
        select: "firstName lastName profileImage",
      },
    })
    .lean();

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const otherParticipantRecord = await ConversationParticipant.findOne({
    conversationId,
    userId: { $ne: userId },
  })
    .populate("userId", "firstName lastName profileImage")
    .lean();

  return {
    ...conversation,
    otherParticipant: otherParticipantRecord?.userId || null,
  };
};

const getUnreadMessageCount = async (userId) => {
  const participations = await ConversationParticipant.find({
    userId,
  }).lean();

  if (!participations || participations.length === 0) {
    return 0;
  }

  let totalUnread = 0;

  for (const part of participations) {
    const filter = {
      conversationId: part.conversationId,
      senderId: { $ne: userId },
    };
    if (part.lastReadAt) {
      filter.createdAt = { $gt: part.lastReadAt };
    }
    const count = await Message.countDocuments(filter);
    totalUnread += count;
  }

  return totalUnread;
};

export {
  checkMutualFollow,
  canChatWithUser,
  getOrCreateConversation,
  sendMessage,
  getConversationMessages,
  markConversationAsRead,
  getUserConversations,
  getConversationById,
  getUnreadMessageCount,
};
