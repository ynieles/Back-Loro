import { body } from "express-validator";
import { validator } from "../utils/validator.util.js";

export const createUserMiddleware = [
  body("nombre")
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage("El nombre de usuario es obligatorio")
    .isString(),
  body("contrasena"),
  validator,
];
