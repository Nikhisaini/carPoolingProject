import bcrypt from "bcrypt";
import User from "../model/user.js";
import crypto from "crypto";
import UserVerification from "../model/userVerification.js";
import sendOtp from "../utils/sendOtp.js";
import client from "../config/twilio.js";
import jwt from "jsonwebtoken";

const validateRegister = ({
  firstName,
  lastName,
  phoneNumber,
  email,
  password,
}) => {
  if (!firstName || !lastName || !phoneNumber || !email || !password) {
    return "All fields are required";
  }

  if (firstName.trim().length < 2) {
    return "First Name must contain at least 2 characters";
  }

  if (lastName.trim().length < 2) {
    return "Last Name must contain at least 2 characters";
  }

  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phoneNumber)) {
    return "Invalid phone number";
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return "Invalid email address";
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  if (!passwordRegex.test(password)) {
    return "Password must contain uppercase, lowercase, number and special character";
  }

  return null;
};

const register = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, email, password } = req.body;

    const validationError = validateRegister({
      firstName,
      lastName,
      phoneNumber,
      email,
      password,
    });

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }
    const existingEmail = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email already exists. Please login.",
      });
    }
    const existingPhone = await User.findOne({
      phoneNumber,
    });

    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: "Phone number already exists.",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phoneNumber,
      email: email.toLowerCase(),
      password: hashedPassword,
      isVerified: false,
    });

    await sendOtp(user._id, user.email, user.firstName, "Register");

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your email.",
      userId: user._id,
    });
  } catch (error) {
    console.error("Registration Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: "User ID and OTP are required",
      });
    }

    const otpData = await UserVerification.findOne({
      userId,
      purpose: "Register",
    });

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (otpData.expiresAt < new Date()) {
      await UserVerification.deleteOne({ _id: otpData._id });

      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    if (otpData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    await User.findByIdAndUpdate(userId, {
      isVerified: true,
    });

    await UserVerification.deleteOne({ _id: otpData._id });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User is already verified",
      });
    }

    await sendOtp(user._id, user.email, user.firstName, "Register");

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully.",
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const login = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber || !password) {
      return res.status(400).json({
        success: false,
        message: "Phone number and password are required",
      });
    }
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: " Invaliud phone number or password",
      });
    }
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "You account is Blocked",
      });
    }
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid Phone number or password",
      });
    }
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export { register, verifyOtp, resendOtp, login };
