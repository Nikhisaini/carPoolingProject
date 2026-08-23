import Licence from "../model/licence.js";
import LicenceCategoryMapping from "../model/LicenceCategoryMapping.js";
import VehicleType from "../model/vehicleType.js";
import VehicleLicenceMapping from "../model/vehicleLicenceMapping.js";

const getUserVehicleTypes = async (req, res) => {
  try {
    const userId = req.user._id;

    const licence = await Licence.findOne({
      userId,
      verificationStatus: "Approved",
    });

    if (!licence) {
      return res.status(404).json({
        success: false,
        message: "Approved driving licence not found",
      });
    }

    const licenceCategories = await LicenceCategoryMapping.find({
      drivingLicenceId: licence._id,
      isActive: true,
    });

    if (licenceCategories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No licence categories found",
      });
    }

    const categoryIds = licenceCategories.map((item) => item.licenceCategoryId);

    const vehicleMappings = await VehicleLicenceMapping.find({
      licenceCategoryId: { $in: categoryIds },
      isActive: true,
    });

    if (vehicleMappings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No vehicle types available for your licence",
      });
    }

    const vehicleTypeIds = [
      ...new Set(vehicleMappings.map((item) => item.vehicleTypeId.toString())),
    ];

    const vehicleTypes = await VehicleType.find({
      _id: { $in: vehicleTypeIds },
      isActive: true,
    }).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      data: vehicleTypes,
    });
  } catch (error) {
    console.error("Get User Vehicle Types Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { getUserVehicleTypes };
