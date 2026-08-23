import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import {
  sendMessage,
  markConversationAsRead,
} from "../services/chatService.js";

import ConversationParticipant from "../model/conversationParticipant.js";

let io;

// userId -> Set of socket IDs
const onlineUsers = new Map();

const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  /*
   * ==========================
   * SOCKET AUTHENTICATION
   * ==========================
   */

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication token required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded?.id) {
        return next(new Error("Invalid authentication token"));
      }

      socket.userId = decoded.id;

      next();
    } catch (error) {
      console.error("Socket Authentication Error:", error);

      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId.toString();

    /*
     * ==========================
     * ONLINE USER
     * ==========================
     */

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }

    onlineUsers.get(userId).add(socket.id);

    /*
     * Personal user room
     */

    socket.join(`user:${userId}`);

    /*
     * ==========================
     * EXISTING RIDE SOCKETS
     * ==========================
     */

    socket.on("ride:join", (rideId) => {
      if (!rideId) {
        return;
      }

      const roomName = `ride:${rideId}`;

      socket.join(roomName);
    });

    socket.on("ride:leave", (rideId) => {
      if (!rideId) {
        return;
      }

      const roomName = `ride:${rideId}`;

      socket.leave(roomName);
    });

    /*
     * ==========================
     * CHAT: JOIN
     * ==========================
     */

    socket.on("chat:join", async (conversationId) => {
      try {
        if (!conversationId) {
          return;
        }

        /*
         * Make sure this user actually belongs
         * to the conversation.
         */

        const participant = await ConversationParticipant.findOne({
          conversationId,
          userId: socket.userId,
        });

        if (!participant) {
          return;
        }

        const roomName = `conversation:${conversationId}`;

        socket.join(roomName);
      } catch (error) {
        console.error("Chat Join Error:", error);
      }
    });

    /*
     * ==========================
     * CHAT: LEAVE
     * ==========================
     */

    socket.on("chat:leave", (conversationId) => {
      if (!conversationId) {
        return;
      }

      const roomName = `conversation:${conversationId}`;

      socket.leave(roomName);
    });

    /*
     * ==========================
     * CHAT: SEND
     * ==========================
     */

    socket.on("chat:send", async (data, callback) => {
      try {
        const { conversationId, message } = data || {};

        if (!conversationId || !message?.trim()) {
          const response = {
            success: false,
            message: "Conversation ID and message are required",
          };

          if (callback) {
            callback(response);
          }

          return;
        }

        /*
         * IMPORTANT:
         *
         * We do NOT take senderId
         * from frontend.
         *
         * senderId comes from authenticated socket.
         */

        const savedMessage = await sendMessage(
          socket.userId,
          conversationId,
          message,
        );

        /*
         * Send to everyone currently inside
         * this conversation.
         */

        io.to(`conversation:${conversationId}`).emit(
          "chat:message",
          savedMessage,
        );

        /*
         * Send notification to participants'
         * personal rooms.
         */

        const participants = await ConversationParticipant.find({
          conversationId,
        }).select("userId");

        for (const participant of participants) {
          const participantId = participant.userId.toString();

          if (participantId !== socket.userId.toString()) {
            io.to(`user:${participantId}`).emit(
              "chat:message:new",
              savedMessage,
            );
          }
        }

        if (callback) {
          callback({
            success: true,
            data: savedMessage,
          });
        }
      } catch (error) {
        console.error("Socket Chat Send Error:", error);

        if (callback) {
          callback({
            success: false,
            message: error.message || "Failed to send message",
          });
        }
      }
    });

    /*
     * ==========================
     * CHAT: READ
     * ==========================
     */

    socket.on("chat:read", async (data, callback) => {
      try {
        const { conversationId } = data || {};

        if (!conversationId) {
          const response = {
            success: false,
            message: "Conversation ID is required",
          };

          if (callback) {
            callback(response);
          }

          return;
        }

        await markConversationAsRead(socket.userId, conversationId);

        /*
         * Notify conversation participants.
         */

        io.to(`conversation:${conversationId}`).emit("chat:read", {
          conversationId,
          userId: socket.userId,
        });

        if (callback) {
          callback({
            success: true,
          });
        }
      } catch (error) {
        console.error("Socket Chat Read Error:", error);

        if (callback) {
          callback({
            success: false,
            message: error.message || "Failed to mark messages as read",
          });
        }
      }
    });

    /*
     * ==========================
     * DISCONNECT
     * ==========================
     */

    socket.on("disconnect", () => {
      const userSockets = onlineUsers.get(userId);

      if (userSockets) {
        userSockets.delete(socket.id);

        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
        }
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
};

const isUserOnline = (userId) => {
  if (!userId) {
    return false;
  }

  const sockets = onlineUsers.get(userId.toString());

  return Boolean(sockets && sockets.size > 0);
};

export { initializeSocket, getIO, isUserOnline };
