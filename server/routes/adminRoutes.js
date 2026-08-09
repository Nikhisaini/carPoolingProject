import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  approveLicence,
  approveVehicle,
  getAllLicence,
  getAllVehicle,
  // getLicenceDetail,
  rejectLicence,
  rejectVehicle,
} from "../controller/adminController.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

const router = express.Router();
/* ================ Licence Verification Routes ==================== */
router.get("/licences", authMiddleware, authorizeRoles("Admin"), getAllLicence);
// router.get("/licence/:id", authMiddleware, getLicenceDetail);
router.put(
  "/licence/:id/approve",
  authMiddleware,
  authorizeRoles("Admin"),
  approveLicence,
);
router.put(
  "/licence/:id/reject",
  authMiddleware,
  authorizeRoles("Admin"),
  rejectLicence,
);

/* ================ Vehicle verification Routes ==================== */
router.get("/vehicles", authMiddleware, authorizeRoles("Admin"), getAllVehicle);
router.put(
  "/vehicle/:id/approve",
  authMiddleware,
  authorizeRoles("Admin"),
  approveVehicle,
);
router.put(
  "/vehicle/:id/reject",
  authMiddleware,
  authorizeRoles("Admin"),
  rejectVehicle,
);

export default router;
