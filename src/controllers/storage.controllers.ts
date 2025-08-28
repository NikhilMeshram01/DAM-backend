import type { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import Asset from "../models/asset.model.js";
import { enqueueProcessingJob } from "../queue/queue.js"; // or general asset processing queue
import minioClient, { BUCKET } from "../configs/minio.js";
import catchAsync from "../utils/catchAsync.js";

// Generate a presigned PUT URL for direct upload to MinIO
export const generatePresignedUrl = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("generatePresignedUrl hit");
    try {
      const { fileName } = req.body;
      if (!fileName) {
        return res.status(400).json({ message: "Filename is required" });
      }

      // Generate a unique key/path for the file
      const ext = path.extname(fileName);
      const id = uuidv4();
      const objectKey = `uploads/${new Date().getFullYear()}/${
        new Date().getMonth() + 1
      }/${id}${ext}`;

      // Generate presigned PUT URL (valid for 5 minutes)
      const url = await minioClient.presignedPutObject(
        BUCKET,
        objectKey,
        60 * 5
      );

      res.status(200).json({ url, key: objectKey });
    } catch (error) {
      next(error);
    }
  }
);

// Confirm the file upload and register it in the database
export const confirmUpload = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("confirmUpload hit");
      const { key, fileName, originalName, mimeType, size, tags, category } =
        req.body;
      const userId = req.user?.userId; // assuming `isAuthenticated` adds `user` to req
      if (!key || !fileName || !mimeType || !size) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Create asset record in DB
      const asset = await Asset.create({
        key,
        fileName,
        originalName,
        mimeType,
        size,
        tags: tags || [],
        category: category || "other",
        uploader: userId || "system",
        status: "pending",
        bucket: process.env.MINIO_BUCKET_NAME || "assets",
        path: key, // you can store the key as path or generate another if needed
        downloadCount: 0,
        metadata: {},
        versions: { original: key },
      });

      // Enqueue processing job (thumbnail, transcode, extract metadata, etc.)
      await enqueueProcessingJob(asset._id.toString());

      return res.status(201).json({
        message: "Upload confirmed and processing started",
        assetId: asset._id,
        status: asset.status,
      });
    } catch (error) {
      next(error);
    }
  }
);

// export const getAssets = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {}
// );
// export const searchAssets = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {}
// );
// export const getAsset = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {}
// );
// export const getAssetDownloadUrl = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {}
// );
// export const deleteAsset = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {}
// );
