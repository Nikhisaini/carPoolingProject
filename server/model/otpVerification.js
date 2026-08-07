import mongoose from "mongoose";

const otpSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    otp: {
      type: String,
      default: null,
    },
    purpose: {
      type: String,
      enum: [
        "Register",
        "Login",
        "ForgetPassword",
        "ChnageEmail",
        "ChangePhone",
      ],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);
const OtpVerification = mongoose.model("OtpVerification", otpSchema);
export default OtpVerification;
