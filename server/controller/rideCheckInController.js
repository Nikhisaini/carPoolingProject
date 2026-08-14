import mongoose from "mongoose";
import {
  markPassengerNoShow,
  sendRideCheckInOtp,
  verifyRideCheckInOtp,
} from "../services/rideCheckInService.js";

const sendCheckInOtp = async (req, res) => {
  try {
    const driverId = req.user._id;
    const { rideId, bookingId } = req.body;

    if (!rideId || !bookingId) {
      return res.status(400).json({
        success: false,
        message: "Ride ID and Booking ID are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(rideId) ||
      !mongoose.Types.ObjectId.isValid(bookingId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid Ride ID or Booking Id",
      });
    }

    const result = await sendRideCheckInOtp({
      rideId,
      bookingId,
      driverId,
    });

    return res.status(200).json({
      success: true,
      message: result.message,
      checkIn: result.checkIn,
    });
  } catch (error) {
    console.error("Send Check-In OTP Error:", error);

    const businessError = [
      "Ride not found",
      "Only the ride driver can send the OTP",
      "Confirmed booking not found",
      "Passenger email not found",
      "Passenger has already been verified",
    ];
    const isBusinessError = businessError.some((message) =>
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

const verifyCheckinOtp = async (req, res) => {
  try {
    const driverId = req.user._id;
    const { bookingId, otp } = req.body;

    if (!bookingId || !otp) {
      return res.status(400).json({
        success: false,
        message: "Booking Id or OTP are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const result = await verifyRideCheckInOtp({
      bookingId,
      driverId,
      otp: String(otp).trim(),
    });

    return res.status(200).json({
      success: true,
      message: result.message,
      checkIn: result.checkIn,
    });
  } catch (error) {
    console.error("Verify Check-In OTP Error:", error);

    const businessErrors = [
      "OTP must be a 6-digit number",
      "Ride check-in not found",
      "Only the ride driver can verify the passenger",
      "Passenger has already been verified",
      "OTP has not been sent",
      "Invalid OTP request",
      "OTP has expired",
      "Maximum OTP attempts exceeded",
      "Invalid OTP.",
    ];

    const isBusinessError = businessErrors.some((message) =>
      error.message?.startsWith(message),
    );

    if (isBusinessError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const markPassengerNoShowed = async (req, res) => {
  try {
    const driverId = req.user._id;

    const { rideId, bookingId, noShowReason, noShowNote } = req.body;

    if (!rideId || !bookingId || !noShowReason) {
      return res.status(400).json({
        success: false,
        message: "Ride ID, Booking ID and no-show reason are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(rideId) ||
      !mongoose.Types.ObjectId.isValid(bookingId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid Ride ID or Booking ID",
      });
    }

    const result = await markPassengerNoShow({
      rideId,
      bookingId,
      driverId,
      noShowNote,
      noShowReason,
    });

    return res.status(200).json({
      success: true,
      message: result.message,
      checkIn: result.checkIn,
    });
  } catch (error) {
    console.error("Mark Passenger No Show Error:", error);

    const businessErrors = [
      "Invalid no-show reason",
      "Ride not found or you are not the driver",
      "Only a started ride can mark passenger as no-show",
      "Confirmed booking not found",
      "Ride check-in not found",
      "Passenger has already been verified",
      "Passenger is already marked as no-show",
    ];

    const isBusinessError = businessErrors.some((message) =>
      error.message?.startsWith(message),
    );

    if (isBusinessError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { sendCheckInOtp, verifyCheckinOtp, markPassengerNoShowed };
