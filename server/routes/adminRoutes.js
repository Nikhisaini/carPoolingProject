import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  approveLicence,
  getAllLicence,
  getLicenceDetail,
  rejectLicence,
} from "../controller/adminController.js";

const router = express.Router();

router.get("/licences", authMiddleware, getAllLicence);
router.get("/licence/:id", authMiddleware, getLicenceDetail);
router.put("licence/:id/approve", approveLicence);
router.put("licence/:id/reject", rejectLicence);

export default router;
