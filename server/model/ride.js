import mongoose from "mongoose";

const rideSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    departureLocationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RideLocation",
      required: true,
    },

    destinationLocationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RideLocation",
      required: true,
    },

    departureAt: {
      type: Date,
      required: true,
    },

    estimatedArrivalAt: {
      type: Date,
      default: null,
    },

    totalSeats: {
      type: Number,
      required: true,
      min: 1,
    },

    availableSeats: {
      type: Number,
      required: true,
      min: 0,
    },

    pricePerSeat: {
      type: Number,
      required: true,
      min: 0,
    },

    // currency: {
    //   type: String,
    //   default: "INR",
    //   trim: true,
    //   uppercase: true,
    // },

    bookingMode: {
      type: String,
      enum: ["AUTO", "MANUAL"],
      default: "AUTO",
    },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "PUBLISHED",
        "FULL",
        "STARTED",
        "COMPLETED",
        "CANCELLED",
        "EXPIRED",
      ],
      default: "PUBLISHED",
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
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

rideSchema.index({
  status: 1,
  departureLocationId: 1,
  destinationLocationId: 1,
  departureAt: 1,
  availableSeats: 1,
});
const Ride = mongoose.model("Ride", rideSchema);

export default Ride;
