import { body, param } from "express-validator";
import { validator } from "../utils/validator.util.js";

export const createDeviceMiddleware = [
  body("codigo_inventario")
    .trim()
    .toUpperCase()
    .notEmpty()
    .withMessage("El código de inventario es obligatorio")
    .isString(),
  body("categoria_id")
    .trim()
    .notEmpty()
    .withMessage("La categoría es obligatoria")
    .isInt(),
  body("departamento_id")
    .trim()
    .notEmpty()
    .withMessage("El departamento es obligatorio")
    .isInt(),
  body("nombre").optional({ checkFalsy: true }).trim().isString(),
  body("ram").optional({ checkFalsy: true }).trim().isString(),
  body("rom").optional({ checkFalsy: true }).trim().isString().toUpperCase(),
  body("modelo").optional({ checkFalsy: true }).trim().isString().toUpperCase(),
  body("numero_telefono").optional({ checkFalsy: true }).trim().isString(),
  body("imei").optional({ checkFalsy: true }).trim().isString(),
  body("observaciones").optional({ checkFalsy: true }).trim().isString(),
  validator,
];

export const updateDeviceMiddleare = [
  body("categoria_id")
    .trim()
    .notEmpty()
    .withMessage("La categoría es obligatoria"),
  body("departamento_id")
    .trim()
    .notEmpty()
    .withMessage("El departamento es obligatorio"),
  body("nombre").optional({ checkFalsy: true }).trim().isString(),
  body("estado").optional({ checkFalsy: true }).trim().isString(),
  body("ram").optional({ checkFalsy: true }).trim().isString(),
  body("rom").optional({ checkFalsy: true }).trim().isString().toUpperCase(),
  body("modelo").optional({ checkFalsy: true }).trim().isString().toUpperCase(),
  body("numero_telefono").optional({ checkFalsy: true }).trim().isString(),
  body("imei").optional({ checkFalsy: true }).trim().isString(),
  body("observaciones").optional({ checkFalsy: true }).trim().isString(),
  validator,
];

export const deleteDeviceMiddleware = [
  param("id").trim().isInt(),
  body("motivo")
    .trim()
    .notEmpty()
    .withMessage("El motivo de desactivación es obligatorio")
    .isString(),
  validator,
];

export const restoreDeviceMiddleware = [param("id").trim().isInt(), validator];
