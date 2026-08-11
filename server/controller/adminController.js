import mongoose from "mongoose";
import Licence from "../model/licence.js";
import LicenceCategoryMapping from "../model/LicenceCategoryMapping.js";
import User from "../model/user.js";
import Vehicle from "../model/vehicle.js";
import verifyDrivingLicence from "../services/cashfreeVerification.js";

const getAllLicence = async (req, res) => {
  try {
    const licences = await Licence.find()
      .populate("userId", "firstName lastName email profileImage phoneNumber")
      .sort({ createdAt: -1 });

    const licenceIds = licences.map((licence) => licence._id);

    const mappings = await LicenceCategoryMapping.find({
      drivingLicenceId: { $in: licenceIds },
      isActive: true,
    }).populate("licenceCategoryId", "name");

    const licencesWithCategories = licences.map((licence) => {
      const licenceMappings = mappings.filter(
        (mapping) =>
          mapping.drivingLicenceId.toString() === licence._id.toString(),
      );

      return {
        ...licence.toObject(),

        categories: licenceMappings
          .map((mapping) => mapping.licenceCategoryId)
          .filter(Boolean),
      };
    });

    return res.status(200).json({
      success: true,
      licences: licencesWithCategories,
    });
  } catch (error) {
    console.log("Get All Licence Error", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const approveLicence = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const licence = await Licence.findById(id);

    if (!licence) {
      return res.status(404).json({
        success: false,
        message: "Driving Licence not found",
      });
    }
    if (
      licence.verificationProvider !== "Cashfree" ||
      !licence.verificationReferenceId
    ) {
      return res.status(400).json({
        success: false,
        message: "Driving licence must be verified before approval.",
      });
    }

    if (licence.verificationResult !== "VALID") {
      return res.status(400).json({
        success: false,
        message: "Driving licence verification failed. It cannot be approved.",
      });
    }

    if (licence.verificationStatus !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Driving Licence is already ${licence.verificationStatus}`,
      });
    }

    licence.verificationStatus = "Approved";
    licence.verifiedBy = req.user._id;
    licence.verifiedAt = new Date();

    await licence.save();

    return res.status(200).json({
      success: true,
      message: "Driving Licence Approved Successfully",
    });
  } catch (error) {
    console.error("Approve Licence Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const rejectLicence = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const licence = await Licence.findById(id);

    if (!licence) {
      return res.status(404).json({
        success: false,
        message: "Driving Licence not found",
      });
    }

    if (licence.verificationStatus !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Driving Licence is already ${licence.verificationStatus}`,
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
    console.error("Reject Licence Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const verifyLicence = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const licence = await Licence.findById(id);

    if (!licence) {
      return res.status(404).json({
        success: false,
        message: "Licence not found",
      });
    }

    if (licence.verificationStatus !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Driving licence is already ${licence.verificationStatus}`,
      });
    }

    if (!licence.dob) {
      return res.status(400).json({
        success: false,
        message: "Date of birth is missing from the licence",
      });
    }

    licence.verificationProvider = "Cashfree";
    licence.verificationAttemptedAt = new Date();
    licence.verificationFailureReason = null;
    licence.verificationResult = null;

    await licence.save();
    const dob = licence.dob.toISOString().split("T")[0];

    let cashfreeResponse;
    try {
      cashfreeResponse = await verifyDrivingLicence(licence.licenceNumber, dob);
    } catch (error) {
      console.error(
        "Cashfree Verification Error:",
        error.response?.data || error.message,
      );

      licence.verificationResult = "ERROR";
      licence.verificationFailureReason =
        error.response?.data?.message ||
        error.response?.data?.error_msg ||
        error.message ||
        "Cashfree verification failed";

      await licence.save();

      return res.status(502).json({
        success: false,
        message: "Driving licence verification service failed.",
        verification: {
          status: "ERROR",
          referenceId: null,
          reason: licence.verificationFailureReason,
        },
      });
    }

    licence.verificationReferenceId =
      cashfreeResponse.reference_id?.toString() || null;

    if (cashfreeResponse.status === "VALID") {
      licence.verificationResult = "VALID";
      licence.verificationFailureReason = null;

      await licence.save();

      return res.status(200).json({
        success: true,
        message: "Driving Licence verified successfully.",
        verification: {
          status: "VALID",
          referenceId: cashfreeResponse.reference_id,
        },
      });
    }

    licence.verificationResult = "INVALID";
    licence.verificationFailureReason =
      cashfreeResponse.message ||
      cashfreeResponse.error_msg ||
      "Driving licence could not be verified.";

    await licence.save();

    return res.status(200).json({
      success: false,
      message: "Driving Licence verification failed.",
      verification: {
        status: "INVALID",
        referenceId: cashfreeResponse.reference_id || null,
        reason: licence.verificationFailureReason,
      },
    });
  } catch (error) {
    console.error("Verify Licence Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getAllVehicle = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({})
      .populate({
        path: "ownerId",
        select: "firstName lastName email phoneNumber profileImage",
      })
      .populate({
        path: "drivingLicenceId",
        select: "licenceNumber verificationStatus frontImage backImage",
      })
      .populate({
        path: "licenceCategoryId",
        select: "name type",
      })
      .populate({
        path: "fuelTypeId",
        select: "name",
      })
      .populate({
        path: "verifiedBy",
        select: "firstName lastName email",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: vehicles.length,
      vehicles,
    });
  } catch (error) {
    console.error("Get All Vehicles Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const approveVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(400).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    if (vehicle.verificationStatus === "Approved") {
      return res.status(400).json({
        success: false,
        message: "Vehicle already approved",
      });
    }

    vehicle.verificationStatus = "Approved";
    vehicle.verifiedBy = req.user._id;
    vehicle.verifiedAt = new Date();

    await vehicle.save();

    return res.status(200).json({
      success: true,
      message: "Vehicle approved successfully",
    });
  } catch (error) {
    console.error("Approve Vehicle Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const rejectVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(400).json({
        success: false,
        message: "Vehicle not found.",
      });
    }

    if (vehicle.verificationStatus === "Rejected") {
      return res.status(400).json({
        success: false,
        message: "Vehicle already rejected",
      });
    }

    vehicle.verificationStatus = "Rejected";
    vehicle.verifiedBy = req.user._id;
    vehicle.verifiedAt = new Date();

    await vehicle.save();

    return res.status(200).json({
      success: true,
      message: "Vehicle rejected successfully",
    });
  } catch (error) {
    console.error("Reject Vehicle Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    console.log("Get All Users Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    if (user.role === "Admin") {
      return res.status(403).json({
        success: false,
        message: "Admin users cannot be blocked",
      });
    }
    if (user.isBlocked) {
      return res.status(400).json({
        success: false,
        message: "User already blocekd",
      });
    }
    user.isBlocked = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User Successfully Blocked",
      userId: user._id,
      isBlocked: user.isBlocked,
    });
  } catch (error) {
    console.log("Error While Block User".error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID",
      });
    }

    const user = await User.findById(userId);
    if (!user.isBlocked) {
      return res.status(400).json({
        success: false,
        message: "User already unblocked",
      });
    }
    user.isBlocked = false;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User Successfully Blocked",
      userId: user._id,
      isBlocked: user.isBlocked,
    });
  } catch (error) {
    console.log("Error While Unblock User".error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
export {
  getAllLicence,
  verifyLicence,
  approveLicence,
  rejectLicence,
  getAllVehicle,
  approveVehicle,
  rejectVehicle,
  getAllUsers,
  blockUser,
  unblockUser,
};
