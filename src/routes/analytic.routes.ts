import express from "express";

import { authenticateJWT } from "../utils/jwt.js";
import {
  getStorageAnalytics,
  getUploadAnalytics,
} from "../controllers/analytics.controllers.js";

const router = express.Router();

router.use(authenticateJWT);

router.get("/analytics/upload", getUploadAnalytics);
router.get("/analytics/storage", getStorageAnalytics);

export default router;
