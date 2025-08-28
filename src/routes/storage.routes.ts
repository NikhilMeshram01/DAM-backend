import { Router } from "express";
import {
  generatePresignedUrl,
  confirmUpload,
} from "../controllers/storage.controllers.js";
import { authenticateJWT } from "../utils/jwt.js";

const router = Router();

router.use(authenticateJWT);

// Step 1: Generate presigned PUT URL for MinIO
router.post("/presign", generatePresignedUrl);

// Step 2: Confirm upload after client sends to MinIO
router.post("/confirm", confirmUpload);

export default router;
