import { Router } from "express";
import { getGovernoratesController } from "../controllers/governorate.controller.js";

const router = Router();

router.get("/", getGovernoratesController);

export default router;