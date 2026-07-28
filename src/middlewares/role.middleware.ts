import { body, param } from "express-validator";
import { validator } from "../utils/validator.util.js";

export const createRoleMiddleware = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isString(),
  body("departamento_id")
    .trim()
    .notEmpty()
    .withMessage("El ID del departamento es obligatorio")
    .isInt(),
  validator,
];

export const getOneRoleMiddleware = [
  param("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isString(),
  validator,
];

export const updateRoleMiddleware = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isString(),
  body("departamento_id")
    .trim()
    .notEmpty()
    .withMessage("El ID del departamento es obligatorio")
    .isInt(),
  param("id").trim().isInt(),
  validator,
];

export const deleteRoleMiddleware = [param("id").trim().isInt(), validator];

export const restoreRoleMiddleware = [param("id").trim().isInt(), validator];
