import mongoose from "mongoose";

const vehicleLicenceMappingSchema = mongoose.Schema(
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
vehicleLicenceMappingSchema.index(
  {
    vehicleTypeId: 1,
    licenceCategoryId: 1,
  },
  {
    unique: true,
  },
);

const VehicleLicenceMapping = mongoose.model(
  "VehicleLicenceMapping",
  vehicleLicenceMappingSchema,
  "vehicle_licenceMapping",
);
export default VehicleLicenceMapping;
