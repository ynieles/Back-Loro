import { body } from "express-validator";
import { validator } from "../utils/validator.util.js";

export const loginMiddleware = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("El nombre de usuario es obligatorio")
    .isEmail(),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .isString(),
  validator,
];
