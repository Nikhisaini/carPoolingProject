import LicenceCategory from "../model/licenceCategory.js";

const getLicenceCategories = async (req, res) => {
  try {
    const categories = await LicenceCategory.find({
      isActive: true,
    })
      .select("_id type name")
      .sort({ type: 1 });

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.log("Get Licence Categories Error", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export { getLicenceCategories };
