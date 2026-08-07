import DrivingLicence from "../model/drivingLicence.js";
import LicenceCategory from "../model/licenceCategory.js";
import LicenceCategoryMapping from "../model/LicenceCategoryMapping.js";

const addlicence = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      licenceNumber,
      // holderName,
      // dob,
      // issueDate,
      // expiryDate,
      categories,
    } = req.body;

    const existinglincence = await DrivingLicence.findOne({ userId });

    if (existinglincence) {
      return res.status(400).json({
        success: false,
        message: "Driving Licence already exists",
      });
    }
    if (
      !licenceNumber ||
      // !holderName ||
      // !dob ||
      // !issueDate ||
      // !expiryDate ||
      !categories
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    if (!req.files || !req.files.frontImage || !req.files.backImage) {
      return res.status(400).json({
        success: false,
        message: "Front and bakc licence images are required",
      });
    }

    const categoryIds = Array.isArray(categories) ? categories : [categories];
    const validCategories = await LicenceCategory.find({
      _id: { $in: categoryIds },
      isActive: true,
    });

    if (validCategories.length !== categoryIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more licence categories are invalid.",
      });
    }
    const licence = await DrivingLicence.create({
      userId,
      licenceNumber,
      // holderName,
      // dob,
      // issueDate,
      // expiryDate,
      frontImage: req.files.frontImage[0].path,
      backImage: req.files.backImage[0].path,
      verificationStatus: "Pending",
    });

    const categoryMappings = categoryIds.map((categoryId) => ({
      drivingLicenceId: licence._id,
      licenceCategoryId: categoryId,
    }));

    await LicenceCategoryMapping.insertMany(categoryMappings);

    const licenceCategories = await LicenceCategoryMapping.find({
      drivingLicenceId: licence._id,
    }).populate({
      path: "licenceCategoryId",
      select: "name",
    });

    return res.status(201).json({
      success: true,
      message: "Driving licence submitted successfully",
      licence,
      categories: licenceCategories,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { addlicence };
