import { Server, Socket } from "socket.io";

let io;

const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("ride:join", (rideId) => {
      if (!rideId) {
        return;
      }
      const roomName = `ride:${rideId}`;
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room ${roomName}`);
    });

    socket.on("ride:leave", (rideId) => {
      if (!rideId) {
        return;
      }

      const roomName = `ride:${rideId}`;
      socket.leave(roomName);
      console.log(`Socket ${socket.id} left room ${roomName}`);
    });
    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
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

export { initializeSocket, getIO };
