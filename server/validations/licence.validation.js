import mongoose from "mongoose";

export const validateAddLicence = (req, res, next) => {
  let { licenceNumber, categories } = req.body;

  // Licence Number
  if (!licenceNumber || !licenceNumber.trim()) {
    return res.status(400).json({
      success: false,
      message: "Licence number is required.",
    });
  }

  req.body.licenceNumber = licenceNumber.trim().toUpperCase();

  // Categories
  if (!categories) {
    return res.status(400).json({
      success: false,
      message: "Licence categories are required.",
    });
  }

  if (!Array.isArray(categories)) {
    categories = [categories];
  }

  if (categories.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Select at least one licence category.",
    });
  }

  // Remove duplicate category IDs
  const uniqueCategories = [...new Set(categories)];

  if (uniqueCategories.length !== categories.length) {
    return res.status(400).json({
      success: false,
      message: "Duplicate licence categories are not allowed.",
    });
  }

  // Validate ObjectIds
  for (const id of uniqueCategories) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid licence category.",
      });
    }
  }

  req.body.categories = uniqueCategories;

  // Images
  if (!req.files?.frontImage?.length) {
    return res.status(400).json({
      success: false,
      message: "Front licence image is required.",
    });
  }

  if (!req.files?.backImage?.length) {
    return res.status(400).json({
      success: false,
      message: "Back licence image is required.",
    });
  }

  next();
};
