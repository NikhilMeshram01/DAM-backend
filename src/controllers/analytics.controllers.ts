import type { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync.js";
import { AppError } from "../utils/errorHandler.js";

export const getUploadAnalytics = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {}
);
export const getStorageAnalytics = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {}
);
