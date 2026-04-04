import crypto from "node:crypto";

import { uploadToR2 } from "../services/r2.service.js";

const VIDEO_SOURCE_URLS = [
  "https://www.w3schools.com/html/mov_bbb.mp4",
  "https://www.w3schools.com/html/movie.mp4",
  "https://samplelib.com/preview/mp4/sample-5s.mp4",
];

const remoteAssetCache = new Map();

const hasR2Config = () =>
  Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME &&
      process.env.R2_PUBLIC_URL,
  );

const extensionFromContentType = (contentType = "") => {
  if (contentType.includes("video/mp4")) return ".mp4";
  if (contentType.includes("video/webm")) return ".webm";
  if (contentType.includes("image/png")) return ".png";
  if (contentType.includes("image/webp")) return ".webp";
  if (contentType.includes("image/jpeg")) return ".jpg";
  return "";
};

const fetchRemoteAsset = async (url) => {
  if (remoteAssetCache.has(url)) {
    return remoteAssetCache.get(url);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to fetch remote seed media: ${url}`);
  }

  const asset = {
    buffer: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get("content-type") || "application/octet-stream",
    resolvedUrl: response.url || url,
  };

  remoteAssetCache.set(url, asset);
  return asset;
};

const uploadRemoteAsset = async ({ sourceUrl, keyPrefix, fileStem }) => {
  const asset = await fetchRemoteAsset(sourceUrl);

  if (!hasR2Config()) {
    return sourceUrl;
  }

  const extension = extensionFromContentType(asset.contentType) || ".bin";
  const key = `${keyPrefix}/${fileStem}-${crypto.randomUUID()}${extension}`;

  return uploadToR2(asset.buffer, key, asset.contentType);
};

const thumbnailSourceFor = (seed) => `https://picsum.photos/seed/${seed}/960/540`;

export const buildSeedLessonMedia = async ({ courseSlug, lessonOrder, seedIndex = 0 }) => {
  const videoSourceUrl = VIDEO_SOURCE_URLS[seedIndex % VIDEO_SOURCE_URLS.length];

  const [videoUrl, thumbnailUrl] = await Promise.all([
    uploadRemoteAsset({
      sourceUrl: videoSourceUrl,
      keyPrefix: `seed/lessons/${courseSlug}`,
      fileStem: `lesson-${lessonOrder}-video`,
    }),
    uploadRemoteAsset({
      sourceUrl: thumbnailSourceFor(`${courseSlug}-${lessonOrder}`),
      keyPrefix: `seed/lessons/${courseSlug}`,
      fileStem: `lesson-${lessonOrder}-thumbnail`,
    }),
  ]);

  return {
    videoUrl,
    thumbnailUrl,
    videoSourceUrl,
  };
};

export const getSeedMediaStrategy = () => ({
  uploadsToR2: hasR2Config(),
  videoSources: VIDEO_SOURCE_URLS,
});
