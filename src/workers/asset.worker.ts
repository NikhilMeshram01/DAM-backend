// workers/asset.worker.ts
import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import { Worker } from "bullmq";
import redis from "../configs/redis.js";
import Asset from "../models/asset.model.js";
import minioClient, { BUCKET } from "../configs/minio.js";
import { saveStreamToTempFile } from "../utils/saveStreamToTempFile.js";
import { extractMetaData } from "../utils/metaDataExtractor.js";
import { MONGODB_URI } from "../configs/configs.js";

await mongoose.connect(MONGODB_URI);
console.log("✅ Connected to MongoDB (worker)");

const assetWorker = new Worker(
  "storage-processing",
  async (job) => {
    const { assetId } = job.data;
    console.log(`Processing asset: ${assetId}`);

    const asset = await Asset.findById(assetId);
    if (!asset) throw new Error("Asset not found");

    const objectStream = await minioClient.getObject(BUCKET, asset.key);

    // Save to disk
    const tempPath = await saveStreamToTempFile(objectStream, asset.fileName);

    // Extract metadata
    const metadata = await extractMetaData(tempPath, asset.mimeType);

    console.log("metadata --> ", metadata);

    asset.metadata = metadata;
    asset.status = "processed";
    await asset.save();

    console.log(`Finished processing asset: ${assetId}`);
    // Optionally delete temp file afterward
    fs.unlink(tempPath, (err) => {
      if (err) console.warn("Failed to delete temp file:", tempPath);
    });
  },
  { connection: redis }
);

assetWorker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

assetWorker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed: ${err.message}`);
});
