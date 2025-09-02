import express from "express";

import { authenticateJWT } from "../utils/jwt.js";
import { authorizeUploaderOrAdmin } from "../middlewares/authorizeUploaderOrAdmin.js";
import { getAdminDashboardStats } from "../controllers/analytics.controllers.js";

const router = express.Router();

router.use(authenticateJWT);

router.get("/", getAdminDashboardStats);

export default router;
