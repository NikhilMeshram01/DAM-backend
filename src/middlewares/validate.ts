import { ZodError, ZodObject, type ZodRawShape } from "zod";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errorHandler.js";

// ZodError : For catching and handling schema validation errors.
// ZodObject<ZodRawShape>:
// -> Specifies that you're expecting a plain z.object({ ... }) schema with no transformations or refinements.
// -> Restricts usage to raw Zod object schemas only.

// Accepts a ZodObject with any shape
export const validate =
  (schema: ZodObject<ZodRawShape>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        next(new AppError(`Validation error: ${message}`, 400));
      } else {
        next(error);
      }
    }
  };
