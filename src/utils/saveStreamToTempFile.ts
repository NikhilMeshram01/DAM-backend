import fs from "fs";
import path from "path";
import { tmpdir } from "os";
import { Readable } from "stream";

export const saveStreamToTempFile = async (
  stream: Readable,
  filename: string
): Promise<string> => {
  const tempPath = path.join(tmpdir(), `${Date.now()}-${filename}`);
  const writeStream = fs.createWriteStream(tempPath);

  return new Promise((resolve, reject) => {
    stream.pipe(writeStream);
    writeStream.on("finish", () => resolve(tempPath));
    writeStream.on("error", reject);
  });
};
