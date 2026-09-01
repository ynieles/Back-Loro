import { body, param } from "express-validator";
import { validator } from "../utils/validator.util.js";
export const createDepartmentMiddleware = [
    body("nombre")
        .trim()
        .notEmpty()
        .withMessage("El nombre es requerido")
        .isString(),
    validator,
];
export const getOneDeparmentMiddleware = [
    param("nombre").isString(),
    validator,
];
export const updateDepartmentMiddleware = [
    body("nombre")
        .trim()
        .notEmpty()
        .withMessage("El nombre es requerido")
        .isString(),
    param("id").trim().isInt(),
    validator,
];
export const deleteDepartmentMiddleware = [
    param("id").trim().isInt(),
    validator,
];
export const restoreDepartmentMiddleware = [
    param("id").trim().isInt(),
    validator,
];
//# sourceMappingURL=department.middleware.js.map