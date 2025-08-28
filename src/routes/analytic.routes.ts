import express from "express";

import { authenticateJWT } from "../utils/jwt.js";
import { authorizeUploaderOrAdmin } from "../middlewares/authorizeUploaderOrAdmin.js";
import { getAdminDashboardStats } from "../controllers/analytics.controllers.js";

const router = express.Router();

router.use(authenticateJWT);
// router.use(authorizeUploaderOrAdmin);

// router.get("/analytics/upload", getUploadAnalytics);
// router.get("/analytics/storage", getStorageAnalytics);

router.get("/", getAdminDashboardStats);

export default router;
