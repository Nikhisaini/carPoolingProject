import Licence from "../model/licence.js";
import LicenceCategory from "../model/licenceCategory.js";
import LicenceCategoryMapping from "../model/LicenceCategoryMapping.js";

const addLicence = async (req, res) => {
  try {
    const userId = req.user._id;
    const licenceNumber = req.body.licenceNumber?.trim().toUpperCase();
    const { dob, categories } = req.body;

    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one licence category.",
      });
    }

    const existingLicence = await Licence.findOne({ userId });

    if (existingLicence) {
      return res.status(400).json({
        success: false,
        message: "Driving licence already exists.",
      });
    }

    const existingLicenceNumber = await Licence.findOne({
      licenceNumber,
    });

    if (existingLicenceNumber) {
      return res.status(400).json({
        success: false,
        message: "Licence number already exists.",
      });
    }

    const uniqueCategories = [...new Set(categories)];

    if (uniqueCategories.length !== categories.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate licence categories are not allowed.",
      });
    }

    const validCategories = await LicenceCategory.find({
      _id: { $in: uniqueCategories },
      isActive: true,
    });

    if (validCategories.length !== uniqueCategories.length) {
      return res.status(400).json({
        success: false,
        message: "One or more licence categories are invalid or inactive.",
      });
    }
    if (!dob) {
      return res.status(400).json({
        success: false,
        message: "Date of birth is required.",
      });
    }

    const parsedDob = new Date(dob);

    if (Number.isNaN(parsedDob.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date of birth.",
      });
    }

    if (parsedDob > new Date()) {
      return res.status(400).json({
        success: false,
        message: "Date of birth cannot be in the future.",
      });
    }

    const licence = await Licence.create({
      userId,
      licenceNumber,
      dob: parsedDob,
      frontImage: req.files.frontImage[0].path,
      backImage: req.files.backImage[0].path,
      verificationStatus: "Pending",
    });

    const categoryMappings = uniqueCategories.map((categoryId) => ({
      drivingLicenceId: licence._id,
      licenceCategoryId: categoryId,
    }));

    await LicenceCategoryMapping.insertMany(categoryMappings);

    const licenceCategories = await LicenceCategoryMapping.find({
      drivingLicenceId: licence._id,
      isActive: true,
    }).populate({
      path: "licenceCategoryId",
      select: "type name",
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

const getLicenceById = async (req, res) => {
  try {
    const userId = req.user._id;

    const licence = await Licence.findOne({ userId });

    if (!licence) {
      return res.status(400).json({
        success: false,
        message: "Licence not found",
      });
    }

    const categoryMappings = await LicenceCategoryMapping.find({
      drivingLicenceId: licence._id,
      isActive: true,
    }).populate("licenceCategoryId");

    const categories = categoryMappings
      .map((mapping) => mapping.licenceCategoryId)
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      licence: {
        ...licence.toObject(),
        categories,
      },
    });
  } catch (error) {
    console.error("Get Licence Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const checkApprovedLicence = async (req, res) => {
  try {
    const userId = req.user._id;

    const licence = await Licence.findOne({
      userId,
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
    console.error("Check Approved Licence Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { addLicence, checkApprovedLicence, getLicenceById };
