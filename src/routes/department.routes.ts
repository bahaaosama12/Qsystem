import { Router } from "express";
import { getDepartmentsController } from "../controllers/department.controller.js";

const router = Router();

router.get("/", getDepartmentsController);

export default router;