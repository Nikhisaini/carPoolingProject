import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getAllRides,
  getRideById,
  publishRide,
  searchRides,
} from "../controller/rideController.js";

const router = express.Router();

router.post("/publish", authMiddleware, publishRide);
router.get("/", getAllRides);
router.get("/search", searchRides);
router.get("/getride/:rideId", getRideById);
export default router;
