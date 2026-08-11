import mongoose from "mongoose";

const licenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    licenceNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    dob: {
      type: Date,
      required: true,
    },

    frontImage: {
      type: String,
      required: true,
    },

    backImage: {
      type: String,
      required: true,
    },

    verificationStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
    verificationResult: {
      type: String,
      enum: ["VALID", "INVALID", "ERROR"],
      default: null,
    },
    verificationProvider: {
      type: String,
      enum: ["Cashfree"],
      default: null,
    },
    verificationReferenceId: {
      type: String,
      default: null,
    },
    verificationAttemptedAt: {
      type: String,
      default: null,
    },
    verificationFailureReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Licence = mongoose.model("Licence", licenceSchema, "licences");

export default Licence;
