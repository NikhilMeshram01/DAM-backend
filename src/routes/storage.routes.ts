import { Router } from "express";
import {
  generatePresignedUrl,
  confirmUpload,
  downloadAsset,
} from "../controllers/storage.controllers.js";
import { authenticateJWT } from "../utils/jwt.js";

const router = Router();

router.use(authenticateJWT);

//  Generate presigned PUT URL for MinIO
router.post("/presign", generatePresignedUrl);

//  Confirm upload after client sends to MinIO
router.post("/confirm", confirmUpload);

// generate a presigned GET URL from MinIO
router.get("/:id/download", downloadAsset);

export default router;
