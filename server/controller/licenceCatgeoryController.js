import LicenceCategory from "../model/licenceCategory.js";

const getLicenceCategories = async (req, res) => {
  try {
    const categories = await LicenceCategory.find({
      isActive: true,
    }).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.log("Get Licence Catgeories Error", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export { getLicenceCategories };
