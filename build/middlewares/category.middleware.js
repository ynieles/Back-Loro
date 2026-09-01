import { body, param } from "express-validator";
import { validator } from "../utils/validator.util.js";
export const createCategoryMiddleware = [
    body("nombre")
        .trim()
        .notEmpty()
        .withMessage("El nombre es obligatorio")
        .isString(),
    validator,
];
export const getOneCategoryMiddleware = [body("nombre")];
export const updateCategoryMiddleware = [
    body("nombre")
        .trim()
        .notEmpty()
        .withMessage("El nombre es obligatorio")
        .isString(),
    param("id").trim().isInt(),
    validator,
];
export const deleteCategoryMiddleware = [param("id").trim().isInt(), validator];
export const restoreCategoryMiddleware = [
    param("id").trim().isInt(),
    validator,
];
//# sourceMappingURL=category.middleware.js.map