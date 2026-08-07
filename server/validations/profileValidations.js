const allowedGender = ["Male", "Femail", "Other"];
const profileVlaidation = (req, res, next) => {
  const { gender, dob } = req.body;

  if (!gender) {
    return res.status(400).json({
      success: false,
      message: "Gender is required",
    });
  }
  if (!allowedGender.includes(gender)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Gender",
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
  next();
};

export default profileVlaidation;
