import Licence from "../model/licence.js";
import LicenceCategory from "../model/licenceCategory.js";
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
    });
    const categoryIds = licenceCategories.map((item) => item.licenceCategoryId);
    const vehicleMappings = await VehicleLicenceMapping.find({
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
