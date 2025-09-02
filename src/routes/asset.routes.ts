import express from "express";
import { authenticateJWT } from "../utils/jwt.js";
import {
  deleteAsset,
  getAsset,
  getAssetDownloadUrl,
  getAssets,
} from "../controllers/asset.controllers.js";
import { authorizeUploaderOrAdmin } from "../middlewares/authorizeUploaderOrAdmin.js";

const router = express.Router();

router.use(authenticateJWT);

router.get("/assets", getAssets);
router.get("/assets/:id", getAsset);
router.get("/assets/:id/download", getAssetDownloadUrl);
// router.delete("/assets/:id", authorizeUploaderOrAdmin, deleteAsset); // 👈 protected route

export default router;
