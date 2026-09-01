import express from "express";
import { requireRole } from "../middlewares/auth.middleware.js";
import {
  createDepartment,
  deleteDepartment,
  getDepartments,
  getOneDeparment,
  restoreDepartment,
  updateDepartment,
} from "../controllers/department.controller.js";
import {
  createDepartmentMiddleware,
  deleteDepartmentMiddleware,
  getOneDeparmentMiddleware,
  restoreDepartmentMiddleware,
  updateDepartmentMiddleware,
} from "../middlewares/department.middleware.js";

const router = express.Router();
const canMutate = requireRole(["admin", "administrador", "supervisor"]);

router.post("/", canMutate, createDepartmentMiddleware, createDepartment);

router.get("/", getDepartments);

router.get("/:nombre", getOneDeparmentMiddleware, getOneDeparment);

router.put("/:id", canMutate, updateDepartmentMiddleware, updateDepartment);
router.patch("/:id", canMutate, updateDepartmentMiddleware, updateDepartment);

router.delete("/:id", canMutate, deleteDepartmentMiddleware, deleteDepartment);

router.patch("/restore/:id", canMutate, restoreDepartmentMiddleware, restoreDepartment);

export default router;
