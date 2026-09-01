import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.util.js";

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  next(new AppError(`Ruta no encontrada: ${req.originalUrl}`, 404));
};
