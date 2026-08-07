import mongoose from "mongoose";

const userVerificationSchema = mongoose.Schema(
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
const UserVerification = mongoose.model(
  "UserVerification",
  userVerificationSchema,
  "user_verifications",
);
export default UserVerification;
