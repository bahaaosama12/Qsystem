import { Router } from "express";
import { getCitiesController } from "../controllers/city.controller.js";

const router = Router();

router.get("/", getCitiesController);

export default router;