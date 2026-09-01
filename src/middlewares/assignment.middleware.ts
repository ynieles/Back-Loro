import { body, param } from "express-validator";
import { validator } from "../utils/validator.util.js";

export const createAssignmentMiddleware = [
  body("equipo_id")
    .trim()
    .notEmpty()
    .withMessage("El equipo es requerido")
    .isInt(),
  body("empleado_id")
    .trim()
    .notEmpty()
    .withMessage("El empleado es requerido")
    .isInt(),
  validator,
];

export const deleteAssignmenteMiddleware = [
  param("id").trim().isInt(),
  body("motivo")
    .trim()
    .notEmpty()
    .withMessage("El motivo de finalización es obligatorio")
    .isString(),
  validator,
];
