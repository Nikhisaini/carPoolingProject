import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    drivingLicenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Licence",
      required: true,
    },

    licenceCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LicenceCategory",
      required: true,
    },

    brand: {
      type: String,
      required: true,
      trim: true,
    },

    model: {
      type: String,
      required: true,
      trim: true,
    },

    manufactureYear: {
      type: Number,
    },

    color: {
      type: String,
      required: true,
      trim: true,
    },

    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    fuelTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FuelType",
      required: true,
    },

    seatingCapacity: {
      type: Number,
      required: true,
      min: 1,
    },

    vehicleImages: [
      {
        type: String,
      },
    ],

    rcFrontImage: {
      type: String,
      required: true,
    },

    rcBackImage: {
      type: String,
      required: true,
    },

    insuranceImage: {
      type: String,
      required: true,
    },

    airCondition: {
      type: Boolean,
      default: true,
    },

    luggageCapacity: {
      type: String,
      default: "",
    },

    verificationStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema, "vehicles");

export default Vehicle;
