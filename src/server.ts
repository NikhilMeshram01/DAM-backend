import dotenv from "dotenv";
dotenv.config();

import connectDB from "./configs/db.js";
import app from "./app.js";
import { PORT } from "./configs/configs.js";
import { ensureBucket } from "./services/storage.js";

const port = PORT || 5001;

connectDB()
  .then(() => {
    console.log("mongodb connected successfully");

    return ensureBucket();
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
