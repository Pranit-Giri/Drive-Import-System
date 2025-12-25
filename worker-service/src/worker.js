import { Worker } from "bullmq";
import { pool } from "./db.js";
import { ensureBucket, minioClient, buildPublicUrl } from "./minio.js";
import { listDriveImages, downloadDriveFileStream } from "./googleDrive.js";

const connection = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT || 6379)
};

const bucket = process.env.MINIO_BUCKET || "images";
await ensureBucket(bucket);

async function setJobStatus(jobId, patch) {
  const fields = [];
  const values = [];
  for (const [k, v] of Object.entries(patch)) {
    fields.push(`${k} = ?`);
    values.push(v);
  }
  values.push(jobId);
  await pool.query(`UPDATE import_jobs SET ${fields.join(", ")} WHERE id = ?`, values);
}

new Worker(
  "imports",
  async (job) => {
    const { jobId, folderUrl } = job.data;
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error("Missing GOOGLE_API_KEY");

    await setJobStatus(jobId, { status: "running", error: null });

    const files = await listDriveImages(folderUrl, apiKey);
    await setJobStatus(jobId, { total_files: files.length });

    let processed = 0;
    let failed = 0;

    for (const f of files) {
      try {
        const objectName = `${f.id}-${f.name}`;
        const stream = await downloadDriveFileStream(f.id, apiKey);

        await minioClient.putObject(
          bucket,
          objectName,
          stream,
          undefined,
          { "Content-Type": f.mimeType || "application/octet-stream" }
        );

        const storagePath = buildPublicUrl(bucket, objectName);

        await pool.query(
          `INSERT INTO images (name, google_drive_id, size_bytes, mime_type, storage_path, source)
           VALUES (?, ?, ?, ?, ?, 'google_drive')
           ON DUPLICATE KEY UPDATE
             name=VALUES(name),
             size_bytes=VALUES(size_bytes),
             mime_type=VALUES(mime_type),
             storage_path=VALUES(storage_path)`,
          [f.name, f.id, f.size ? Number(f.size) : null, f.mimeType || null, storagePath]
        );

        processed++;
        await setJobStatus(jobId, { processed_files: processed, failed_files: failed });
        await job.updateProgress(Math.round((processed / Math.max(files.length, 1)) * 100));
      } catch {
        failed++;
        await setJobStatus(jobId, { processed_files: processed, failed_files: failed });
      }
    }

    await setJobStatus(jobId, { status: "done" });
    return { total: files.length, processed, failed };
  },
  { connection, concurrency: 5 }
);
