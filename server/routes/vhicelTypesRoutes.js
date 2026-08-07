import express from "express";
import { getUserVehicleTypes } from "../controller/vehicelTypeController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/list", authMiddleware, getUserVehicleTypes);

export default router;
