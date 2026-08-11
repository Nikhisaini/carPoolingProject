import "dotenv/config";
import express from "express";
import connectDb from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import path from "path";
import profileRoutes from "./routes/profileRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import licenceRoutes from "./routes/licenceRoutes.js";
import licenceCategoryRoutes from "./routes/licenceCategoryRoutes.js";
import fuelTypesRoutes from "./routes/fuelTypesRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import rideRouter from "./routes/rideRoutes.js";
import startLicenceVerificationCron from "./cron/licenceVerificationCron.js";
await connectDb();
startLicenceVerificationCron();
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
app.use("/api/fuel-type", fuelTypesRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ride", rideRouter);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
