import express from "express";
import { createDepartment, getDepartments, } from "../controllers/departamentos.controller.js";
import { createDepartmentMiddleware } from "../middlewares/departamento.middleware.js";
const router = express.Router();
router.post("/", createDepartmentMiddleware, createDepartment);
router.get("/", getDepartments);
export default router;
//# sourceMappingURL=departamentos.route.js.map