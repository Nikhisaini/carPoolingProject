import express from "express";
import { getLicenceCategories } from "../controller/licenceCategoryController.js";

const router = express.Router();

router.get("/", getLicenceCategories);
export default router;
