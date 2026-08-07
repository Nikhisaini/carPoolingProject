import mongoose from "mongoose";

const licenceCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  description: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const LicenceCategory = mongoose.model(
  "LicenceCategory",
  licenceCategorySchema,
  "licence_category",
);

export default LicenceCategory;
