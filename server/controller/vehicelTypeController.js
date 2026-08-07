import DrivingLicence from "../model/drivingLicence.js";
import LicenceCategory from "../model/licenceCategory.js";
import LicenceCategoryMapping from "../model/LicenceCategoryMapping.js";
import VehicleType from "../model/vehicleType.js";
import VehicleTypeLicenceCategoryMapping from "../model/VehicleTypeLicenceCategoryMapping.js";

const getUserVehicleTypes = async (req, res) => {
  try {
    const userId = req.user._id;
    const licence = await DrivingLicence.findOne({
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
    });
    const categoryIds = licenceCategories.map((item) => item.licenceCategoryId);
    const vehicleMappings = await VehicleTypeLicenceCategoryMapping.find({
      licenceCategoryId: { $in: categoryIds },
    });

    const vehicleTypeIds = vehicleMappings.map((item) => item.vehicleTypeId);
    const vehicleTypes = await VehicleType.find({
      _id: { $in: vehicleTypeIds },
    });
    return res.json({
      success: true,
      data: vehicleTypes,
    });
  } catch (error) {
    console.log(error);
  }
};

export { getUserVehicleTypes };
