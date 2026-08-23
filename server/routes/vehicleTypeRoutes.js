import express from "express";
import { getUserVehicleTypes } from "../controller/vehicleTypeController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/list", authMiddleware, getUserVehicleTypes);

export default router;
