import Licence from "../model/licence.js";
import LicenceCategory from "../model/licenceCategory.js";
import LicenceCategoryMapping from "../model/LicenceCategoryMapping.js";

const addLicence = async (req, res) => {
  try {
    const userId = req.user._id;
    const { licenceNumber, categories } = req.body;

    // Check if user already has a licence
    const existingLicence = await Licence.findOne({ userId });

    if (existingLicence) {
      return res.status(400).json({
        success: false,
        message: "Driving licence already exists.",
      });
    }

    // Check duplicate licence number
    const existingLicenceNumber = await Licence.findOne({
      licenceNumber,
    });

    if (existingLicenceNumber) {
      return res.status(400).json({
        success: false,
        message: "Licence number already exists.",
      });
    }

    // Verify categories exist and are active
    const validCategories = await LicenceCategory.find({
      _id: { $in: categories },
      isActive: true,
    });

    if (validCategories.length !== categories.length) {
      return res.status(400).json({
        success: false,
        message: "One or more licence categories are invalid or inactive.",
      });
    }

    // Create licence
    const licence = await Licence.create({
      userId,
      licenceNumber,
      frontImage: req.files.frontImage[0].path,
      backImage: req.files.backImage[0].path,
      verificationStatus: "Pending",
    });

    // Create category mappings
    const categoryMappings = categories.map((categoryId) => ({
      drivingLicenceId: licence._id,
      licenceCategoryId: categoryId,
    }));

    await LicenceCategoryMapping.insertMany(categoryMappings);

    // Fetch licence categories
    const licenceCategories = await LicenceCategoryMapping.find({
      drivingLicenceId: licence._id,
    }).populate({
      path: "licenceCategoryId",
      select: "name",
    });

    return res.status(201).json({
      success: true,
      message: "Driving licence submitted successfully.",
      licence,
      categories: licenceCategories,
    });
  } catch (error) {
    console.error("Add Licence Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const checkApprovedLicence = async (req, res) => {
  try {
    const userId = req.user._id;

    const licence = await Licence.findOne({
      userId: userId,
      verificationStatus: "Approved",
    });

    if (!licence) {
      return res.status(200).json({
        success: false,
        message: "Driving licence approval pending",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Licence approved",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { addLicence, checkApprovedLicence };
