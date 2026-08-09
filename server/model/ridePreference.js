import mongoose from "mongoose";

const ridePreferenceSchema = new mongoose.Schema(
  {
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      required: true,
      unique: true,
    },

    smokingAllowed: {
      type: Boolean,
      default: false,
    },

    petsAllowed: {
      type: Boolean,
      default: false,
    },

    luggageAllowed: {
      type: Boolean,
      default: true,
    },

    musicAllowed: {
      type: Boolean,
      default: true,
    },

    conversationAllowed: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const RidePreference = mongoose.model(
  "RidePreference",
  ridePreferenceSchema,
  "ride_Preference",
);

export default RidePreference;
