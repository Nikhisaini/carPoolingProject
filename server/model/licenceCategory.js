import mongoose from "mongoose";

const licenceCategorySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
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

licenceCategorySchema.index({ type: 1, name: 1 }, { unique: true });

const LicenceCategory = mongoose.model(
  "LicenceCategory",
  licenceCategorySchema,
  "category",
);

export default LicenceCategory;
