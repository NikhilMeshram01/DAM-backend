import type { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync.js";
import { AppError } from "../utils/errorHandler.js";

export const uploadAsset = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {}
);
export const getAssets = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {}
);
export const searchAssets = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {}
);
export const getAsset = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {}
);
export const getAssetDownloadUrl = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {}
);
export const deleteAsset = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {}
);
