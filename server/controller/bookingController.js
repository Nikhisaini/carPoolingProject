import mongoose from "mongoose";
import { createBooking } from "../services/bookingService.js";
import validateBooking from "../validations/validateBooking.js";
import Ride from "../model/ride.js";
import BookingSeat from "../model/bookingSeat.js";
import Booking from "../model/bookings.js";

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
      razorpayOrder: result.razorpayOrder,
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
      "You cannot book your own ride",
      "This ride has already departed",
      "Only",
      "You have already booked this ride",
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

const myBookings = async (req, res) => {
  try {
    const userId = req.user._id;

    const bookings = await Booking.find({
      passengerId: userId,
    }).populate({
      path: "rideId",
      populate: [
        {
          path: "ownerId",
          select:
            "firstName lastName profileImage rating averageRating ratingAverage",
        },
        {
          path: "vehicleId",
        },
        {
          path: "departureLocationId",
        },
        {
          path: "destinationLocationId",
        },
      ],
    });

    if (!bookings) {
      return res.status(400).json({
        success: false,
        message: "No booking found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "My Bookings Fetched Successfully",
      bookings,
    });
  } catch (error) {
    console.error("Get Bookings Error", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getBookingDetail = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      passengerId: userId,
    })
      .populate({
        path: "rideId",
        populate: [
          {
            path: "ownerId",
            select:
              "firstName lastName profileImage rating averageRating ratingAverage",
          },
          {
            path: "vehicleId",
          },
          {
            path: "departureLocationId",
          },
          {
            path: "destinationLocationId",
          },
        ],
      })
      .lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const seats = await BookingSeat.find({
      bookingId: booking._id,
      status: "CONFIRMED",
    })
      .select("seatNumber status")
      .sort({ seatNumber: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Booking fetched successfully",
      booking: {
        ...booking,
        seats,
      },
    });
  } catch (error) {
    console.error("Get Booking Detail Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export { bookRide, getRideSeats, myBookings, getBookingDetail };
