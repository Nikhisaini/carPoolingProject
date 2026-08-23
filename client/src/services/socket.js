import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8081";

const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  auth: (cb) => {
    const token = localStorage.getItem("token");
    cb({ token });
  },
});

socket.on("connect", () => {
  console.log("SOCKET CONNECTED:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("SOCKET CONNECT ERROR:", error.message);
});

socket.on("disconnect", (reason) => {
  console.log("SOCKET DISCONNECTED:", reason);
});

export const connectSocket = (token) => {
  const authToken = token || localStorage.getItem("token");
  if (!authToken) {
    console.warn("No token provided for socket connection");
    return;
  }
  socket.auth = { token: authToken };
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket;
