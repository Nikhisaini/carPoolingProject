import mongoose from "mongoose";

const vehicleTypeLicenceCategoryMappingSchema = mongoose.Schema(
  {
    vehicleTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VehicleType",
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
vehicleTypeLicenceCategoryMappingSchema.index(
  {
    vehicleTypeId: 1,
    licenceCategoryId: 1,
  },
  {
    unique: true,
  },
);

const VehicleTypeLicenceCategoryMapping = mongoose.model(
  "VehicleTypeLicenceCategoryMapping",
  vehicleTypeLicenceCategoryMappingSchema,
);
export default VehicleTypeLicenceCategoryMapping;
