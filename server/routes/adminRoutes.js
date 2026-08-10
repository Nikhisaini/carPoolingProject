import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  approveLicence,
  approveVehicle,
  blockUser,
  getAllLicence,
  getAllUsers,
  getAllVehicle,
  rejectLicence,
  rejectVehicle,
  unblockUser,
} from "../controller/adminController.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

const router = express.Router();
/* ================ Licence Verification Routes ==================== */
router.get("/licences", authMiddleware, authorizeRoles("Admin"), getAllLicence);
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

/*===================== User Management Routes =======================*/
router.get("/users", authMiddleware, authorizeRoles("Admin"), getAllUsers);
router.patch(
  "/users/:userId/block",
  authMiddleware,
  authorizeRoles("Admin"),
  blockUser,
);
router.patch(
  "/users/:userId/unblock",
  authMiddleware,
  authorizeRoles("Admin"),
  unblockUser,
);
export default router;
