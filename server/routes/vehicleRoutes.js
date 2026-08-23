import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  addVehicle,
  deleteVehicle,
  getMyVehicles,
  getSingleVehicle,
  updateVehicle,
} from "../controller/vehicleController.js";
import uploadVehicle from "../middleware/uploadVehicle.js";
import multerErrorHandler from "../middleware/multerErrorHandler.js";

const router = express.Router();

router.post(
  "/add",
  authMiddleware,
  uploadVehicle.fields([
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
  multerErrorHandler,
  addVehicle,
);

router.get("/my-vehicles", authMiddleware, getMyVehicles);
router.get("/:id", authMiddleware, getSingleVehicle);
router.put(
  "/update/:id",
  authMiddleware,
  uploadVehicle.fields([
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
  multerErrorHandler,
  updateVehicle,
);
router.delete("/delete/:id", authMiddleware, deleteVehicle);
export default router;
