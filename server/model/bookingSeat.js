import mongoose from "mongoose";

const bookingSeatSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      required: true,
      index: true,
    },
    seatNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["HELD", "CONFIRMED", "CANCELLED"],
      default: "HELD",
      index: true,
    },
    heldAt: {
      type: Date,
      default: Date.now,
    },
    holdExpiresAt: {
      type: Date,
      default: null,
    },
    confirmAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

bookingSeatSchema.index(
  {
    rideId: 1,
    seatNumber: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: {
        $in: ["HELD", "CONFIRMED"],
      },
    },
  },
);

const BookingSeat = mongoose.model(
  "BookingSeat",
  bookingSeatSchema,
  "booking_seat",
);

export default BookingSeat;
