import express from "express";
import { getFuelTypes } from "../controller/fuelTypeController.js";

const router = express.Router();

router.get("/list", getFuelTypes);
export default router;
