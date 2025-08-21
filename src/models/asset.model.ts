import { Schema, model, Document, Types } from "mongoose";

export interface IAsset extends Document {
  _id: Types.ObjectId;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: string;
  width?: number;
  height?: number;
  duration?: number;
  pages?: number;
  bucket: string;
  path: string;
  versions: {
    original: string;
    thumbnail?: string;
    medium?: string;
    "1080"?: string;
    "720"?: string;
    preview?: string;
    waveform?: string;
  };
  tags: string[];
  metadata: Record<string, any>;
  category: "image" | "video" | "audio" | "document" | "archive" | "other";
  status: "processing" | "pending" | "failed";
  uploader: string;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const AssetSchema: Schema = new Schema(
  {
    originalName: { type: String, required: true },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: String, required: true },
    width: Number,
    height: Number,
    duration: Number,
    pages: Number, // for PDFs and document
    bucket: { type: String, required: true, default: "assets" },
    path: { type: String, required: true },
    versions: {
      original: { type: String, required: true },
      thumbnail: String,
      medium: String,
      "1080": String,
      "720": String,
      preview: String, // for PDFs and document
      waveform: String, // for audio
    },
    tags: [{ type: String }],
    metadata: { type: Schema.Types.Mixed, default: {} },
    category: {
      type: String,
      enum: ["image", "video", "audio", "document", "archive", "other"],
      required: true,
    },
    status: {
      type: String,
      enum: ["processing", "pending", "failed"],
      default: "processing",
    },
    uploader: { type: String, default: "system" },
    downloadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

AssetSchema.index({ _id: 1 });
AssetSchema.index({ mimeType: 1 });
AssetSchema.index({ category: 1 });
AssetSchema.index({ tags: 1 });
AssetSchema.index({ createdAt: 1 });
AssetSchema.index({ status: 1 });

const Asset = model<IAsset>("Asset", AssetSchema);
export default Asset;
