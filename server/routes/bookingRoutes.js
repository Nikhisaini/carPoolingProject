import express from "express";
import {
  bookRide,
  getBookingDetail,
  getRideSeats,
  myBookings,
} from "../controller/bookingController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my-bookings", authMiddleware, myBookings);
router.get("/detail/:bookingId", authMiddleware, getBookingDetail);
router.post("/book", authMiddleware, bookRide);
router.get("/ride/:rideId/seats", authMiddleware, getRideSeats);
export default router;
