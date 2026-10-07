import { Router } from "express";
import { getBranchController, getBranchesController } from "../controllers/branch.controller.js";

const router = Router();

router.get("/", getBranchesController);
router.get("/:id", getBranchController);

export default router;
