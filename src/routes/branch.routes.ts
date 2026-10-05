import { Router } from "express";
import { getBranchesController } from "../controllers/branch.controller.js";

const router = Router();

router.get("/", getBranchesController);

export default router;