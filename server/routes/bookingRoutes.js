import express from "express";
import { bookRide } from "../controller/bookingController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/book", authMiddleware, bookRide);

export default router;
