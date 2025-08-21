import express from "express";

import { authenticateJWT } from "../utils/jwt.js";
import {
  deleteAsset,
  getAsset,
  getAssetDownloadUrl,
  getAssets,
  searchAssets,
  uploadAsset,
} from "../controllers/asset.controllers.js";

const router = express.Router();

router.use(authenticateJWT);

router.post("/assets/upload", uploadAsset);
router.get("/assets", getAssets);
router.get("/assets/search", searchAssets);
router.get("/assets/:id", getAsset);
router.get("/assets/:id/download", getAssetDownloadUrl);
router.delete("/assets/:id", deleteAsset);

export default router;
