import mongoose from "mongoose";

const LicenceSchema = new mongoose.Schema(
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

    // rejectReason: {
    //   type: String,
    //   default: "",
    // },

    // adminRemark: {
    //   type: String,
    //   default: "",
    // },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Licence = mongoose.model("Licence", LicenceSchema);

export default Licence;
