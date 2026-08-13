import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  cancelRide,
  // getAllRides,
  getMyRides,
  getPublishRideEligibility,
  getRideById,
  publishRide,
  searchRides,
} from "../controller/rideController.js";

const router = express.Router();

router.post("/publish", authMiddleware, publishRide);
router.get("/publish-eligibility", authMiddleware, getPublishRideEligibility);
// router.get("/", getAllRides);
router.get("/my-rides", authMiddleware, getMyRides);
router.get("/search", searchRides);
router.get("/:rideId", authMiddleware, getRideById);
router.patch("/cancel/:rideId", authMiddleware, cancelRide);

export default router;
