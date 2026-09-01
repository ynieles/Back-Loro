import express from "express";
import { requireRole } from "../middlewares/auth.middleware.js";
import {
  createEmployee,
  deleteEmployee,
  getEmployeeHistory,
  getEmployees,
  getOneEmployee,
  restoreEmployee,
  updateEmployee,
} from "../controllers/employee.controller.js";
import {
  createEmployeeMiddleware,
  deleteEmployeeMiddleware,
  getOneEmployeeMiddleware,
  restoreEmployeeMiddleware,
  updateEmployeeMiddleware,
} from "../middlewares/employee.middleware.js";

const router = express.Router();
const canMutate = requireRole(["admin", "administrador", "supervisor"]);

router.post("/", canMutate, createEmployeeMiddleware, createEmployee);

router.get("/", getEmployees);

router.get("/history/:id", getEmployeeHistory);
router.get("/:id/history", getEmployeeHistory);

router.get("/:ci", getOneEmployeeMiddleware, getOneEmployee);

router.put("/:id", canMutate, updateEmployeeMiddleware, updateEmployee);

router.delete("/:id", canMutate, deleteEmployeeMiddleware, deleteEmployee);

router.patch("/restore/:id", canMutate, restoreEmployeeMiddleware, restoreEmployee);

export default router;

