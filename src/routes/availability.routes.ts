import { Router } from "express";
import { getAvailabilityController } from "../controllers/availability.controller.js";

const router = Router();

router.get("/", getAvailabilityController);

export default router;