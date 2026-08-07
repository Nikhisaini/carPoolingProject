import mongoose from "mongoose";

const licenceCategoryMappingSchema = new mongoose.Schema(
  {
    drivingLicenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DrivingLicence",
      required: true,
    },
    licenceCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LicenceCategory",
      required: true,
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

licenceCategoryMappingSchema.index(
  {
    drivingLicenceId: 1,
    licenceCategoryId: 1,
  },
  {
    unique: true,
  },
);
const LicenceCategoryMapping = mongoose.model(
  "LicenceCategoryMapping",
  licenceCategoryMappingSchema,
);

export default LicenceCategoryMapping;
