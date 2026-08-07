import express, { Router } from "express";
import { getLicenceCategories } from "../controller/licenceCatgeoryController.js";

const router = express.Router();

router.get("/", getLicenceCategories);
export default router;
