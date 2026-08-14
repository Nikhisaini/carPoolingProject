import mongoose from "mongoose";

const rideCheckInSchema = mongoose.Schema(
  {
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      required: true,
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
      index: true,
    },
    passengerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["WAITING", "OTP_SENT", "VERIFIED", "NO_SHOW"],
      default: "WAITING",
    },
    otpHash: {
      type: String,
      default: null,
    },
    otpSentAt: {
      type: Date,
      default: null,
    },
    otpExpiresAt: {
      type: Date,
      default: null,
    },
    otpAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    noShowAt: {
      type: Date,
      default: null,
    },
    noShowReason: {
      type: String,
      enum: [
        "PASSENGER_NOT_ARRIVED",
        "PASSENGER_NOT_REACHABLE",
        "PASSENGER_REFUSED_TO_BOARD",
        "OTHER",
      ],
      default: null,
    },

    noShowNote: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const RideCheckIn = mongoose.model(
  "RideCheckIn",
  rideCheckInSchema,
  "ride_checkon",
);
export default RideCheckIn;
