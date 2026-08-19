import mongoose from "mongoose";

const conversationParticipantSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    lastReadAt: {
      type: Date,
      default: null,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

conversationParticipantSchema.index(
  {
    conversationId: 1,
    userId: 1,
  },
  {
    unique: true,
  },
);

conversationParticipantSchema.index({
  userId: 1,
  updatedAt: -1,
});

const ConversationParticipant = mongoose.model(
  "ConversationParticipant",
  conversationParticipantSchema,
  "conversation_participants",
);

export default ConversationParticipant;
