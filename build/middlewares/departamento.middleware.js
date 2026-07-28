import { body } from "express-validator";
import { validator } from "../utils/validator.util.js";
export const createDepartmentMiddleware = [
    body("name").notEmpty().withMessage("El  nombre es requerido").isString(),
    validator,
];
//# sourceMappingURL=departamento.middleware.js.map