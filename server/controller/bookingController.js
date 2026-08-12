import mongoose from "mongoose";
import { createBooking } from "../services/bookingService.js";
import validateBooking from "../validations/validateBooking.js";
import Ride from "../model/ride.js";
import BookingSeat from "../model/bookingSeat.js";

const bookRide = async (req, res) => {
  try {
    const passengerId = req.user._id;

    const { rideId, seats } = req.body;

    const validation = validateBooking({
      rideId,
      seats,
    });

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const result = await createBooking({
      rideId: validation.data.rideId,
      passengerId,
      seats: validation.data.seats,
    });

    return res.status(201).json({
      success: true,
      message:
        result.booking.status === "CONFIRMED"
          ? "Ride booked successfully"
          : "Booking request submitted successfully",
      booking: result.booking,
    });
  } catch (error) {
    console.error("Book Ride Error:", error);

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "One or more selected seats are not available",
      });
    }

    const businessErrors = [
      "Ride is not available for booking",
      "This ride has already departed",
      "Only",
      "Seat number must be between",
      "are no longer available",
    ];

    const isBusinessError = businessErrors.some((message) =>
      error.message?.startsWith(message),
    );

    if (isBusinessError) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getRideSeats = async (req, res) => {
  try {
    const { rideId } = req.params;
    if (!rideId) {
      return res.status(400).json({
        success: false,
        message: "Ride ID is required",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(rideId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ride ID",
      });
    }
    const ride = await Ride.findById(rideId)
      .select("totalSeats availableSeats status")
      .lean();

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }
    const bookingSeats = await BookingSeat.find({
      rideId,
      status: {
        $in: ["HELD", "CONFIRMED"],
      },
    })
      .select("seatNumber status")
      .lean();

    const occupiedSeats = bookingSeats.map((seat) => seat.seatNumber);
    return res.status(200).json({
      success: true,
      message: "Ride seats fetched successfully",
      totalSeats: ride.totalSeats,
      availableSeats: ride.availableSeats,
      occupiedSeats,
    });
  } catch (error) {
    console.error("Get Ride Seats Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export { bookRide, getRideSeats };
