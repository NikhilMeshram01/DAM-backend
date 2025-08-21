import { Router, type Request, type Response } from "express";
import multer from "multer";
import fs from "fs";
import {
  detectMime,
  getObjectStream,
  presignedGetURL,
  presignedPUTURL,
  uploadFromPath,
} from "../services/storage.js";
import path from "path";

const router = Router();

const upload = multer({ dest: "dist/uploads/" });

// upload via server
// router.post(
//   "/files",
//   upload.single("file"),
//   async (req: Request, res: Response) => {
//     try {
//       if (!req.file) return res.status(400).json({ error: "file is required" });

//       const key = `${Date.now()}-${req.file.originalname.replace(/\s+/g, "_")}`;
//       const mime = await detectMime(req.file.originalname);
//       await uploadFromPath(key, req.file.path, mime);

//       fs.unlink(req.file.path, (err) => {
//         if (err) console.warn("Failed to delete temp file:", err);
//       });

//       return res.json({ key });
//     } catch (error: any) {
//       console.error(error);
//       return res.status(500).json({ error: "upload failed" });
//     }
//   }
// );

// download (stream)
router.get("/files/:key", async (req: Request, res: Response) => {
  try {
    const key = req.params.key;
    if (!key) return res.status(400).json({ error: "key is required" });

    const stream = await getObjectStream(key);

    res.setHeader(
      "Content-Disposition",
      `inline; filename="${path.basename(key)}"`
    );
    stream.pipe(res);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "download failed" });
  }
});

// presigned PUT URL
router.put("/files/presign-put", async (req: Request, res: Response) => {
  try {
    //  acceptonly file name and not the file from body
    const { filename } = req.body;
    if (!filename)
      return res.status(400).json({ error: "filename is required" });

    const key = `${Date.now()}-${String(filename).replace(/\s+/g, "_")}`;
    console.log("1");
    const url = await presignedPUTURL(key, 60 * 10);
    console.log("2");
    return res.json({ url, expiresInSeconds: 600 });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "could not generate PUT url" });
  }
});

// presigned GET URL
router.get("/files/:key/url", async (req: Request, res: Response) => {
  try {
    const key = req.params.key;
    if (!key) return res.status(400).json({ error: "key is required" });

    const url = await presignedGetURL(key, 60 * 60);
    return res.json({ url, expiresInSeconds: 3600 });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "could not generate GET url" });
  }
});

export default router;
