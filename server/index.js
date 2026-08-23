import "dotenv/config";
import express from "express";
import http from "http";
import connectDb from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import path from "path";
import profileRoutes from "./routes/profileRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import licenceRoutes from "./routes/licenceRoutes.js";
import licenceCategoryRoutes from "./routes/licenceCategoryRoutes.js";
import fuelTypeRoutes from "./routes/fuelTypeRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import rideRouter from "./routes/rideRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

import startLicenceVerificationCron from "./cron/licenceVerificationCron.js";
import startSeatHoldCleanupCron from "./cron/seatHoldCleanupCron.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import { initializeSocket } from "./socket/socketServer.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import rideCheckInRoutes from "./routes/rideCheckInRoutes.js";
import userFollowRoutes from "./routes/userFollowRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
await connectDb();
startLicenceVerificationCron();
startSeatHoldCleanupCron();
const app = express();
const corsoptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsoptions));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/licence", licenceRoutes);
app.use("/api/vehicle", vehicleRoutes);
app.use("/api/licence-category", licenceCategoryRoutes);
app.use("/api/fuel-type", fuelTypeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ride", rideRouter);
app.use("/api/booking", bookingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/ride-checkin", rideCheckInRoutes);
app.use("/api/follow", userFollowRoutes);
app.use("/api/chat", chatRoutes);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

const PORT = process.env.PORT || 8081;
const httpServer = http.createServer(app);
initializeSocket(httpServer);
httpServer.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
