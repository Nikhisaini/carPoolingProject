import User from "../model/user.js";

const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const dbUser = await User.findById(userId).select("-password");
    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      user: dbUser,
    });
  } catch (error) {
    console.error("Get Profile Error", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { firstName, lastName, gender, dob } = req.body;
    if (!gender || !["Male", "Femail", "Other"].includes(gender)) {
      return res.status(400).json({
        success: false,
        message: "Pleace select a valid gender.",
      });
    }

    if (!dob) {
      return res.status(400).json({
        success: false,
        message: "Date of birth is required",
      });
    }
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date of birth",
      });
    }
    const today = new Date();
    if (!birthDate > today) {
      return res.status(400).json({
        success: false,
        message: "Cate of birth cannot be in the future.",
      });
    }
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthdifference = today.getMonth() - birthDate.getMonth();

    if (
      monthdifference < 0 ||
      (monthdifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (age < 18) {
      return res.status(400).json({
        success: false,
        message: "You must be at least 10 years old",
      });
    }

    const updateData = {
      firstName,
      lastName,
      gender,
      dob,
      profileCompleted: true,
    };
    if (req.file) {
      updateData.profileImage = req.file.path;
    }
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile Error", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    await User.findByIdAndDelete(userId, {
      isBlocked: true,
      deletedAt: new Date(),
    });
    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export { getProfile, updateProfile, deleteProfile };
