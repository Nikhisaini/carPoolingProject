import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  addVehicle,
  deleteVehicle,
  getMyVehicles,
  getSingleVehicle,
  updateVehicle,
} from "../controller/vehicleController.js";
import uploadVehicel from "../middleware/uploadVehicle.js";

const router = express.Router();

router.post(
  "/add",
  authMiddleware,
  uploadVehicel.fields([
    {
      name: "vehicleImages",
      maxCount: 5,
    },
    {
      name: "rcFrontImage",
      maxCount: 1,
    },
    {
      name: "rcBackImage",
      maxCount: 1,
    },
    {
      name: "insuranceImage",
      maxCount: 1,
    },
  ]),
  addVehicle,
);

router.get("/my-vehicles", authMiddleware, getMyVehicles);
router.get("/:id", authMiddleware, getSingleVehicle);
router.put(
  "/update/:id",
  authMiddleware,
  uploadVehicel.fields([
    {
      name: "vehicleImages",
      maxCount: 5,
    },
    {
      name: "rcFrontImage",
      maxCount: 1,
    },
    {
      name: "rcBackImage",
      maxCount: 1,
    },
    {
      name: "insuranceImage",
      maxCount: 1,
    },
  ]),
  updateVehicle,
);
router.delete("/delete/:id", authMiddleware, deleteVehicle);
export default router;
