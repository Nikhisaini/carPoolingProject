import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  addLicence,
  checkApprovedLicence,
  getLicenceById,
} from "../controller/licenceController.js";
import uploadLicence from "../middleware/uploadLicence.js";
import { validateAddLicence } from "../validations/licence.validation.js";
import multerErrorHandler from "../middleware/multerErrorHandler.js";

const router = express.Router();
router.get("/check-approved", authMiddleware, checkApprovedLicence);
router.get("/my-licence", authMiddleware, getLicenceById);
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
  multerErrorHandler,
  validateAddLicence,
  addLicence,
);

export default router;
