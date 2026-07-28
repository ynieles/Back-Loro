import express from "express";
import {
  createEmployee,
  deleteEmployee,
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

router.post("/", createEmployeeMiddleware, createEmployee);

router.get("/", getEmployees);

router.get("/:ci", getOneEmployeeMiddleware, getOneEmployee);

router.put("/:id", updateEmployeeMiddleware, updateEmployee);

router.delete("/:id", deleteEmployeeMiddleware, deleteEmployee);

router.patch("/restore/:id", restoreEmployeeMiddleware, restoreEmployee);

export default router;
