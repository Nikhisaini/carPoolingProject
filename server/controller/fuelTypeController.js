import FuelType from "../model/fuelType.js";

const getFuelTypes = async (req, res) => {
  try {
    const furelTypes = await FuelType.find({
      isActive: true,
    }).select("name");

    return res.status(200).json({
      success: true,
      data: furelTypes,
    });
  } catch (error) {
    console.log("Get FuelTypes Error", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { getFuelTypes };
