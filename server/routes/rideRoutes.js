import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  cancelRide,
  // getAllRides,
  getMyRides,
  getPublishRideEligibility,
  getRideById,
  handleCompleteRide,
  publishRide,
  searchRides,
  startRide,
} from "../controller/rideController.js";

const router = express.Router();

router.get("/publish-eligibility", authMiddleware, getPublishRideEligibility);
// router.get("/", getAllRides);
router.get("/my-rides", authMiddleware, getMyRides);
router.get("/search", searchRides);
router.post("/publish", authMiddleware, publishRide);
router.get("/:rideId", authMiddleware, getRideById);
router.patch("/cancel/:rideId", authMiddleware, cancelRide);
router.patch("/start/:rideId", authMiddleware, startRide);
router.patch("/complete/:rideId", authMiddleware, handleCompleteRide);

export default router;
