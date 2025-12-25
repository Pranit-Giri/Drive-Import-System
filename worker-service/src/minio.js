import * as Minio from "minio";

export const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: Number(process.env.MINIO_PORT || 9000),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
});

export async function ensureBucket(bucket) {
  const exists = await minioClient.bucketExists(bucket).catch(() => false);
  if (!exists) await minioClient.makeBucket(bucket);
}

export function buildPublicUrl(bucket, objectName) {
  const base = process.env.PUBLIC_MINIO_BASE_URL?.replace(/\/$/, "");
  return `${base}/${bucket}/${encodeURIComponent(objectName)}`;
}
