import type { Request, Response, NextFunction } from "express";
import type Joi from "joi";

type ValidationSource = "body" | "params" | "query";

export const validate = (
  schema: Joi.ObjectSchema,
  source: ValidationSource = "body",
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req[source], {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        code: "VALIDATION_ERROR",
        details: error.details.map((detail) => detail.message),
      });
    }

    next();
  };
};