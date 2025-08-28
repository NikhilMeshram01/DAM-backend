import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { Worker } from "bullmq";
import redis from "../configs/redis.js";
import Asset from "../models/asset.model.js";
import minioClient, { BUCKET } from "../configs/minio.js";
import { saveStreamToTempFile } from "../utils/saveStreamToTempFile.js";
import { extractMetaData } from "../utils/metaDataExtractor.js";
import {
  generateVideoThumbnail,
  generatePdfThumbnail,
  generateTextThumbnail,
  generateDocxThumbnail,
} from "../utils/thumbnailGenerator.js";
import { MONGODB_URI } from "../configs/configs.js";
import Analytics from "../models/analytics.model.js";

await mongoose.connect(MONGODB_URI);
console.log("✅ Connected to MongoDB (worker)");

const assetWorker = new Worker(
  "storage-processing",
  async (job) => {
    const { assetId } = job.data;
    console.log(`🚀 Processing asset: ${assetId}`);

    const asset = await Asset.findById(assetId);
    if (!asset) throw new Error("Asset not found");

    // Download object from MinIO
    const objectStream = await minioClient.getObject(BUCKET, asset.key);
    const tempPath = await saveStreamToTempFile(objectStream, asset.fileName);

    // Extract metadata
    const metadata = await extractMetaData(tempPath, asset.mimeType);

    // Prepare thumbnail generation folder
    const tempThumbDir = path.join("/tmp", "thumbnails");
    fs.mkdirSync(tempThumbDir, { recursive: true });

    let thumbnailPath = "";

    try {
      const fileBaseName = path.basename(
        asset.fileName,
        path.extname(asset.fileName)
      );

      if (asset.mimeType.startsWith("video/")) {
        // Video thumbnail (e.g., mp4)
        thumbnailPath = await generateVideoThumbnail(
          tempPath,
          tempThumbDir,
          fileBaseName
        );
      } else if (asset.mimeType === "application/pdf") {
        // PDF thumbnail
        thumbnailPath = await generatePdfThumbnail(
          tempPath,
          tempThumbDir,
          fileBaseName
        );
      } else if (
        asset.mimeType ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || // DOCX
        asset.mimeType === "application/msword"
      ) {
        // DOCX and older Word formats → convert & generate thumbnail
        thumbnailPath = await generateDocxThumbnail(
          tempPath,
          tempThumbDir,
          fileBaseName
        );
      } else if (asset.mimeType.startsWith("text/")) {
        // Text files
        thumbnailPath = await generateTextThumbnail(
          tempPath,
          tempThumbDir,
          fileBaseName
        );
      }

      if (thumbnailPath && fs.existsSync(thumbnailPath)) {
        // Upload thumbnail to MinIO
        const thumbStream = fs.createReadStream(thumbnailPath);
        const thumbnailKey = `thumbnails/${asset._id}.jpg`;
        await minioClient.putObject(BUCKET, thumbnailKey, thumbStream);

        // Save thumbnail path in versions object
        asset.versions = {
          ...asset.versions,
          thumbnail: thumbnailKey,
        };
      }
    } catch (err: any) {
      console.warn("⚠️ Thumbnail generation failed:", err.message);
    }

    asset.metadata = metadata;
    asset.status = "processed";
    await asset.save();

    // Cleanup temp files
    fs.unlink(tempPath, () => {});
    if (thumbnailPath && fs.existsSync(thumbnailPath)) {
      fs.unlink(thumbnailPath, () => {});
    }

    console.log(`✅ Finished processing asset: ${assetId}`);
  },
  { connection: redis }
);

assetWorker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

assetWorker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed: ${err.message}`);
});
