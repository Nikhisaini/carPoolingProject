import fs from "fs";
import Licence from "../model/licence.js";
import FuelType from "../model/fuelType.js";
import LicenceCategory from "../model/licenceCategory.js";
import LicenceCategoryMapping from "../model/LicenceCategoryMapping.js";
import Vehicle from "../model/vehicle.js";

const deleteFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const validateVehicle = async ({ licence, licenceCategoryId, fuelTypeId }) => {
  const category = await LicenceCategory.findOne({
    _id: licenceCategoryId,
    isActive: true,
  });

  if (!category) {
    return {
      success: false,
      message: "Invalid vehicle category",
    };
  }

  const fuelTypeData = await FuelType.findOne({
    _id: fuelTypeId,
    isActive: true,
  });

  if (!fuelTypeData) {
    return {
      success: false,
      message: "Invalid fuel type",
    };
  }

  const licenceCategory = await LicenceCategoryMapping.findOne({
    drivingLicenceId: licence._id,
    licenceCategoryId: category._id,
    isActive: true,
  });

  if (!licenceCategory) {
    return {
      success: false,
      message: "Your driving licence does not allow this vehicle category",
    };
  }

  return {
    success: true,
    category,
    fuelTypeData,
  };
};

const addVehicle = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      licenceCategoryId,
      brand,
      model,
      manufactureYear,
      color,
      registrationNumber,
      fuelTypeId,
      seatingCapacity,
    } = req.body;

    const licence = await Licence.findOne({
      userId,
      verificationStatus: "Approved",
    });

    if (!licence) {
      return res.status(400).json({
        success: false,
        message:
          "Your driving licence is not approved. Please verify your driving licence first.",
      });
    }

    const validation = await validateVehicle({
      licence,
      licenceCategoryId,
      fuelTypeId,
    });

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const { category, fuelTypeData } = validation;

    if (!registrationNumber || !registrationNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: "Registration number is required",
      });
    }

    const normalizedRegistrationNumber = registrationNumber
      .trim()
      .toUpperCase();

    const existingVehicle = await Vehicle.findOne({
      registrationNumber: normalizedRegistrationNumber,
    });

    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: "Vehicle already registered",
      });
    }

    if (
      !req.files ||
      !req.files.vehicleImages ||
      !req.files.rcFrontImage ||
      !req.files.rcBackImage ||
      !req.files.insuranceImage
    ) {
      return res.status(400).json({
        success: false,
        message: "Please upload all required images",
      });
    }

    const vehicleImages = req.files.vehicleImages.map((file) => file.path);

    await Vehicle.create({
      ownerId: userId,
      drivingLicenceId: licence._id,
      licenceCategoryId: category._id,
      brand,
      model,
      manufactureYear: Number(manufactureYear),
      color,
      registrationNumber: normalizedRegistrationNumber,
      fuelTypeId: fuelTypeData._id,
      seatingCapacity: Number(seatingCapacity),
      vehicleImages,
      rcFrontImage: req.files.rcFrontImage[0].path,
      rcBackImage: req.files.rcBackImage[0].path,
      insuranceImage: req.files.insuranceImage[0].path,
      verificationStatus: "Pending",
    });

    return res.status(201).json({
      success: true,
      message: "Vehicle added successfully. Waiting for admin approval.",
    });
  } catch (error) {
    console.error("Add Vehicle Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getMyVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({
      ownerId: req.user._id,
    })
      .populate("licenceCategoryId", "type name")
      .populate("fuelTypeId", "name")
      .populate("drivingLicenceId", "licenceNumber verificationStatus")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: vehicles.length,
      vehicles,
    });
  } catch (error) {
    console.error("Get My vehicle Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const getSingleVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findOne({
      _id: id,
      ownerId: req.user._id,
    })
      .populate("licenceCategoryId", "type name")
      .populate("fuelTypeId", "name")
      .populate("drivingLicenceId", "licenceNumber verificationStatus");

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    return res.status(200).json({
      success: true,
      vehicle,
    });
  } catch (error) {
    console.log("Get Vehicle Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findOne({
      _id: id,
      ownerId: req.user._id,
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    const licence = await Licence.findOne({
      userId: req.user._id,
      verificationStatus: "Approved",
    });

    if (!licence) {
      return res.status(400).json({
        success: false,
        message:
          "Your driving licence is not approved. Please verify your driving licence first.",
      });
    }

    const {
      licenceCategoryId,
      brand,
      model,
      manufactureYear,
      color,
      registrationNumber,
      fuelTypeId,
      seatingCapacity,
    } = req.body;

    const validation = await validateVehicle({
      licence,
      licenceCategoryId: licenceCategoryId || vehicle.licenceCategoryId,
      fuelTypeId: fuelTypeId || vehicle.fuelTypeId,
    });

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const { category, fuelTypeData } = validation;

    if (
      registrationNumber &&
      registrationNumber.trim().toUpperCase() !== vehicle.registrationNumber
    ) {
      const normalizedRegistrationNumber = registrationNumber
        .trim()
        .toUpperCase();

      const existingVehicle = await Vehicle.findOne({
        registrationNumber: normalizedRegistrationNumber,
        _id: { $ne: id },
      });

      if (existingVehicle) {
        return res.status(400).json({
          success: false,
          message: "Vehicle already registered",
        });
      }

      vehicle.registrationNumber = normalizedRegistrationNumber;
    }

    vehicle.licenceCategoryId = category._id;
    vehicle.fuelTypeId = fuelTypeData._id;
    vehicle.brand = brand || vehicle.brand;
    vehicle.model = model || vehicle.model;
    vehicle.manufactureYear = manufactureYear || vehicle.manufactureYear;
    vehicle.color = color || vehicle.color;
    vehicle.seatingCapacity = seatingCapacity || vehicle.seatingCapacity;

    if (req.files?.vehicleImages) {
      vehicle.vehicleImages.forEach((imagePath) => {
        deleteFile(imagePath);
      });

      vehicle.vehicleImages = req.files.vehicleImages.map((file) => file.path);
    }

    if (req.files?.rcFrontImage) {
      deleteFile(vehicle.rcFrontImage);
      vehicle.rcFrontImage = req.files.rcFrontImage[0].path;
    }

    if (req.files?.rcBackImage) {
      deleteFile(vehicle.rcBackImage);
      vehicle.rcBackImage = req.files.rcBackImage[0].path;
    }

    if (req.files?.insuranceImage) {
      deleteFile(vehicle.insuranceImage);
      vehicle.insuranceImage = req.files.insuranceImage[0].path;
    }

    vehicle.verificationStatus = "Pending";
    vehicle.verifiedBy = null;
    vehicle.verifiedAt = null;

    await vehicle.save();

    return res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      vehicle,
    });
  } catch (error) {
    console.log("Update Vehicle Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findOne({
      _id: id,
      ownerId: req.user._id,
    });

    if (!vehicle) {
      return res.status(400).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    vehicle.vehicleImages.forEach((imagePath) => {
      deleteFile(imagePath);
    });

    deleteFile(vehicle.rcFrontImage);
    deleteFile(vehicle.rcBackImage);
    deleteFile(vehicle.insuranceImage);

    await Vehicle.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    console.log("Delete Vehicle Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export {
  addVehicle,
  getSingleVehicle,
  updateVehicle,
  deleteVehicle,
  getMyVehicles,
};
