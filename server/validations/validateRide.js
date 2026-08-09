import Vehicle from "../model/vehicle.js";

const validateRideVehicle = async ({ userId, vehicleId }) => {
  const vehicle = await Vehicle.findOne({
    _id: vehicleId,
    ownerId: userId,
    verificationStatus: "Approved",
    isActive: true,
  }).populate({
    path: "drivingLicenceId",
    select: "verificationStatus",
  });

  if (!vehicle) {
    return {
      success: false,
      message:
        "Vehicle not found, not approved, inactive, or does not belong to you.",
    };
  }

  if (
    !vehicle.drivingLicenceId ||
    vehicle.drivingLicenceId.verificationStatus !== "Approved"
  ) {
    return {
      success: false,
      message: "The driving licence linked to this vehicle is not approved.",
    };
  }

  return {
    success: true,
    vehicle,
  };
};

export default validateRideVehicle;
