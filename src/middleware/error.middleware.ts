import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = error instanceof AppError ? error.statusCode : 500;

  res.status(statusCode).json({
    code: error instanceof AppError ? error.code : "INTERNAL_SERVER_ERROR",
    message: error.message,
  });
};
