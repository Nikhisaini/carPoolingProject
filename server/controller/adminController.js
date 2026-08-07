import Licence from "../model/licence.js";

const getAllLicence = async (req, res) => {
  try {
    const licences = await Licence.find()
      .populate("userId", "firstName lastName email profileImage phoneNumber")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      licences,
    });
  } catch (error) {
    console.log("Get All Licence Error", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
const getLicenceDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const licence = await Licence.findById(id).populate(
      "userId",
      "firstname lastname email phoneNumber profileImage",
    );

    if (!licence) {
      return res.status(400).json({
        success: false,
        message: "Driving Licence not found",
      });
    }
    return res.status(200).json({
      success: true,
      licence,
    });
  } catch (error) {
    console.log("Get Licence Detail Error", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const approveLicence = async (req, res) => {
  try {
    const { id } = req.params;

    const licence = await Licence.findById(id);

    if (!licence) {
      return res.status(400).json({
        success: false,
        message: "Driving Licence not found",
      });
    }
    if (licence.verificationStatus === "Approved") {
      return res.status(400).json({
        success: false,
        message: "Driving Licence Already Approved",
      });
    }

    licence.verificationStatus = "Approved";
    licence.verifiedBy = User._id;
    licence.verifiedAt = new Date();

    await licence.save();

    return res.status(200).json({
      success: true,
      message: "Driving Licence Approved Successfully",
    });
  } catch (error) {
    console.log("Approve Licence Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const rejectLicence = async (req, res) => {
  try {
    const { id } = req.params;

    const licence = await Licence.findById(id);
    if (!licence) {
      return res.status(400).json({
        success: false,
        message: "Driving Licence Not Found.",
      });
    }

    if (licence.verificationStatus === "Pending") {
      return res.status(400).json({
        success: false,
        message: "Driving Licence Already Rejected",
      });
    }

    licence.verificationStatus = "Rejected";
    licence.verifiedBy = req.user._id;
    licence.verifiedAt = new Date();

    await licence.save();
    return res.status(200).json({
      success: true,
      message: "Driving Licence Rejected Successfully",
    });
  } catch (error) {
    console.log("Reject Licence Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export { getAllLicence, getLicenceDetail, approveLicence, rejectLicence };
