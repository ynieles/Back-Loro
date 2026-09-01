import type { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Ocurrió un error interno en el servidor";

  console.error(
    `[ERROR] ${req.method} ${req.originalUrl} - ${statusCode}: ${message}`,
  );
  if (process.env.NODE_ENV !== "production" && err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    status: "error",
    statusCode,
    error: message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};
