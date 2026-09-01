import { body, param } from "express-validator";
import { validator } from "../utils/validator.util.js";
export const createEmployeeMiddleware = [
    body("ci").trim().notEmpty().withMessage("La CI es obligatoria").isString(),
    body("nombre")
        .trim()
        .notEmpty()
        .withMessage("EL nombre es obligatorio")
        .isString(),
    body("rol_id").notEmpty().withMessage("El rol es obligatorio").isInt(),
    validator,
];
export const updateEmployeeMiddleware = [
    body("ci").trim().notEmpty().withMessage("La ci es requerida").isString(),
    param("id").trim().isInt(),
    body("nombre")
        .trim()
        .notEmpty()
        .withMessage("EL nombre es requerido")
        .isString(),
    body("rol_id").trim().notEmpty().withMessage("El rol es requerido").isInt(),
    validator,
];
export const getOneEmployeeMiddleware = [
    param("ci").isInt().withMessage("La ci es requerida"),
    validator,
];
export const deleteEmployeeMiddleware = [param("id").isInt(), validator];
export const restoreEmployeeMiddleware = [param("id").isInt(), validator];
//# sourceMappingURL=employee.middleware.js.map