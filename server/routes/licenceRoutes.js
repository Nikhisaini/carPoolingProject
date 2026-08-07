import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  addlicence,
  checkApprovedLicence,
} from "../controller/licenceController.js";
import uploadLicence from "../middleware/uploadLicence.js";

const router = express.Router();

router.post(
  "/add",
  authMiddleware,
  uploadLicence.fields([
    {
      name: "frontImage",
      maxCount: 1,
    },
    {
      name: "backImage",
      maxCount: 1,
    },
  ]),
  addlicence,
);
router.get("/check-approved", authMiddleware, checkApprovedLicence);
export default router;
