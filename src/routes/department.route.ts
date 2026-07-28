import express from "express";
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

router.post("/", createDepartmentMiddleware, createDepartment);

router.get("/", getDepartments);

router.get("/:nombre", getOneDeparmentMiddleware, getOneDeparment);

router.patch("/:id", updateDepartmentMiddleware, updateDepartment);

router.delete("/:id", deleteDepartmentMiddleware, deleteDepartment);

router.patch("/restore/:id", restoreDepartmentMiddleware, restoreDepartment);

export default router;
