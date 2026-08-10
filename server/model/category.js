import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      enum: ["LMV", "MCWG", "HMV"],
    },

    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      enum: ["Car", "Bike", "Bus"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Category = mongoose.model("Category", categorySchema);

export default Category;
