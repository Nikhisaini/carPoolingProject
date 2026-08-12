import express from "express";
import { bookRide, getRideSeats } from "../controller/bookingController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/book", authMiddleware, bookRide);
router.get("/ride/:rideId/seats", authMiddleware, getRideSeats);
export default router;
