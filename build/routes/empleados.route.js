import express from "express";
import { createEmployee, getEmployees, getOneEmployee, updateEmployee, } from "../controllers/empleados.controller.js";
import { createEmployeeMiddleware, getOneEmployeeMiddleware, updateEmployeeMiddleware, } from "../middlewares/empleados.middleware.js";
const router = express.Router();
router.post("/", createEmployeeMiddleware, createEmployee);
router.get("/", getEmployees);
router.get("/:ci", getOneEmployeeMiddleware, getOneEmployee);
router.put("/:id", updateEmployeeMiddleware, updateEmployee);
export default router;
//# sourceMappingURL=empleados.route.js.map