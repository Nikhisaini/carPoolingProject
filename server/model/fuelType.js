import mongoose from "mongoose";

const fuelTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const FuelType = mongoose.model("FuelType", fuelTypeSchema);

export default FuelType;
