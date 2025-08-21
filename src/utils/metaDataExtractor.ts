import fs from "fs";
import sharp from "sharp";
import mm from "music-metadata";
import poppler from "pdf-poppler";
import Ffmpeg from "fluent-ffmpeg";
import textract from "textract";

export const extractMetaData = async (
  filePath: string,
  mimeType: string
): Promise<Record<string, string>> => {
  const metadata: Record<string, any> = {};

  try {
    const stats = fs.statSync(filePath);
    metadata.size = stats.size;
    metadata.lastModified = stats.mtime;

    // extract tags from filename
    const filename = filePath.split("/").pop() || "";
    metadata.tags = extractTagsFromFilename(filename);

    if (mimeType.startsWith("image/")) {
      const imageMetadata = await sharp(filePath).metadata();
      metadata.width = imageMetadata.width;
      metadata.height = imageMetadata.height;
      metadata.format = imageMetadata.format;
      metadata.space = imageMetadata.space;
      metadata.channels = imageMetadata.channels;
      metadata.density = imageMetadata.density;
    } else if (mimeType.startsWith("video/")) {
      metadata.duration = await getVideoDuration(filePath);
      metadata.format = mimeType.split("/")[1];

      //   get video dimensions
      const videoDims = await getVideoDimensions(filePath);
      if (videoDims) {
        metadata.width = videoDims.width;
        metadata.height = videoDims.height;
      }
    } else if (mimeType.startsWith("audio/")) {
      const audioMetadat = await mm.parseFile(filePath);
      metadata.duration = audioMetadat.format.duration;
      metadata.bitrate = audioMetadat.format.bitrate;
      metadata.codec = audioMetadat.format.codec;

      if (audioMetadat.common) {
        metadata.title = audioMetadat.common.title;
        metadata.artist = audioMetadat.common.artist;
        metadata.album = audioMetadat.common.album;
        metadata.year = audioMetadat.common.year;
        metadata.genre = audioMetadat.common.genre;
      }
    } else if (mimeType.startsWith("application/pdf")) {
      // extract pdf metadata
      const pdfInfo = await poppler.info(filePath);
      metadata.pages = pdfInfo.pages;
      metadata.title = pdfInfo.title;
      metadata.author = pdfInfo.author;
      metadata.pdfVersion = pdfInfo.pdf_version;

      //   extract text content for search indexing
      try {
        const text = await extractText(filePath, mimeType);
        metadata.textContent = text.substring(0, 1000); // store first 1000 characters
      } catch (error) {
        console.warn("could not extract text from pdf : ", error);
      }
    } else if (
      mimeType.startsWith("text/") ||
      mimeType === "application/msword" ||
      mimeType === "application/vnd.ms-excel" ||
      mimeType === "application/vnd.ms-powerpoint"
    ) {
      // extract text from documents
      try {
        const text = await extractText(filePath, mimeType);
        metadata.textContent = text.substring(0, 1000); // store first 1000 characters
      } catch (error) {
        console.warn("could not extract text from document : ", error);
      }
    }
  } catch (error) {
    console.error("Error extracting metadata : ", error);
  }
  return metadata;
};
export const getVideoDuration = async (filePath: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    Ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) reject(err);
      resolve(metadata.format.duration || 0);
    });
  });
};
export const getVideoDimensions = async (
  filePath: string
): Promise<{ width: number; height: number } | null> => {
  return new Promise((resolve, reject) => {
    Ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) reject(err);

      const videoStream = metadata.streams.find(
        (stream) => stream.codec_type === "video"
      );
      if (videoStream) {
        resolve({
          width: videoStream.width || 0,
          height: videoStream.height || 0,
        });
      } else {
        resolve(null);
      }
    });
  });
};

export const extractText = async (
  filePath: string,
  mimeType: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    textract.fromFileWithMimeAndPath(mimeType, filePath, (err, text) => {
      if (err) reject(err);
      resolve(text);
    });
  });
};

export const extractTagsFromFilename = (filename: string): string[] => {
  const tags: string[] = [];
  const nameWithoutExt = filename.split(".").slice(0, -1).join(".");

  //   extract words seperated by underscore, hyphens, or camelCase
  const words = nameWithoutExt.split(/[_\-\s]+/);

  for (const word of words) {
    if (word.length > 2) {
      tags.push(word.toLowerCase());
    }
  }

  return tags;
};

export const getFileCategory = (mimeType: string): string => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.startsWith("application/pdf")) return "document";

  if (
    mimeType.startsWith("text/") ||
    mimeType === "appplication/msword" ||
    mimeType === "appplication/vnd.ms-excel" ||
    mimeType === "appplication/vnd.ms-powerpoint"
  ) {
    return "document";
  }
  return "other";
};
