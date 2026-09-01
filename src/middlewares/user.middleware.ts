import { body } from "express-validator";
import { validator } from "../utils/validator.util.js";

export const createUserMiddleware = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre de usuario es obligatorio")
    .isString(),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .isString()
    .isLength({ min: 6 })
    .withMessage("La contraseña debe contener al menos 6 caracteres"),
  body("rol")
    .trim()
    .notEmpty()
    .withMessage("El rol es obligatorio")
    .isIn(["admin", "user"])
    .withMessage("El rol debe ser 'admin' o 'user'"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("El correo electrónico es obligatorio")
    .isEmail()
    .withMessage("Ingrese un correo electrónico válido"),
  validator,
];

export const updateUserMiddleware = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre de usuario es obligatorio")
    .isString(),
  body("rol")
    .trim()
    .notEmpty()
    .withMessage("El rol es obligatorio")
    .isIn(["admin", "user"])
    .withMessage("El rol debe ser 'admin' o 'user'"),
  validator,
];

export const updatePasswordMiddleware = [
  body("password")
    .trim()
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .isString()
    .isLength({ min: 6 })
    .withMessage("La contraseña debe contener al menos 6 caracteres"),
  validator,
];

