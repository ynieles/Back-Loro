import { body, param } from "express-validator";
import { validator } from "../utils/validator.util.js";
export const createEmployeeMiddleware = [
    body("ci").notEmpty().withMessage("La ci es requerida").isString(),
    body("nombre").notEmpty().withMessage("EL nombre es requerido").isString(),
    body("departamento_id")
        .notEmpty()
        .withMessage("El departamento es requerido")
        .isInt(),
    validator,
];
export const updateEmployeeMiddleware = [
    body("ci").notEmpty().withMessage("La ci es requerida").isString(),
    param("id").isInt(),
    body("nombre").notEmpty().withMessage("EL nombre es requerido").isString(),
    body("departamento_id")
        .notEmpty()
        .withMessage("El departamento es requerido")
        .isInt(),
    validator,
];
export const getOneEmployeeMiddleware = [param("ci").isInt(), validator];
//# sourceMappingURL=empleados.middleware.js.map