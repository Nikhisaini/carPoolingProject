import mongoose from "mongoose";

const rideLocationSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
      default: "",
    },
    country: {
      type: String,
      trim: true,
      default: "India",
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    placeName: {
      type: String,
      trim: true,
      default: "",
    },
    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },

    placeId: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

rideLocationSchema.index({
  city: 1,
});

const RideLocation = mongoose.model(
  "RideLocation",
  rideLocationSchema,
  "ride_location",
);

export default RideLocation;
