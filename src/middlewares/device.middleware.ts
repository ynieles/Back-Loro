import { body, param } from "express-validator";
import { validator } from "../utils/validator.util.js";

export const createDeviceMiddleware = [
  body("codigo_inventario")
    .trim()
    .toUpperCase()
    .notEmpty()
    .withMessage("El codigo de inventario es obligatorio")
    .isString(),
  body("nombre").trim().isString(),
  body("categoria_id")
    .trim()
    .notEmpty()
    .withMessage("La categoria es obligatoria")
    .isInt(),
  body("departamento_id")
    .trim()
    .notEmpty()
    .withMessage("El departamento es obligatorio")
    .isInt(),
  body("ram").trim().isString(),
  body("rom").trim().isString().toUpperCase(),
  body("modelo").trim().isString().toUpperCase(),
  body("numero_telefono").trim().isString(),
  body("imei").trim().isString(),
  body("observaciones").trim().isString(),
  validator,
];

export const updateDeviceMiddleare = [
  body("nombre").trim().isString(),
  body("categoria_id")
    .trim()
    .notEmpty()
    .withMessage("La categoria es obligatoria"),
  body("departamento_id")
    .trim()
    .notEmpty()
    .withMessage("El departamento es obligatorio"),
  body("estado").trim().isString(),
  body("estado").trim().isString(),
  body("ram").trim().isString(),
  body("rom").trim().isString().toUpperCase(),
  body("modelo").trim().isString().toUpperCase(),
  body("numero_telefono").trim().isString(),
  body("imei").trim().isString(),
  body("observaciones").trim().isString(),
  validator,
];

export const deleteDeviceMiddleware = [param("id").trim().isInt(), validator];

export const restoreDeviceMiddleware = [param("id").trim().isInt(), validator];
