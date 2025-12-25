import express from "express";
import cors from "cors";
import { nanoid } from "nanoid";
import { initDb, pool } from "./db.js";
import { importQueue } from "./queue.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => res.json({ ok: true }));

// Required by assignment [file:1]
app.post("/importgoogle-drive", async (req, res) => {
  const { folderUrl } = req.body || {};
  if (!folderUrl || typeof folderUrl !== "string") {
    return res.status(400).json({ error: "folderUrl is required" });
  }

  const jobId = nanoid();

  await pool.query(
    `INSERT INTO import_jobs (id, source_url, source, status)
     VALUES (?, ?, 'google_drive', 'queued')`,
    [jobId, folderUrl]
  );

  await importQueue.add("import-google-drive", { jobId, folderUrl }, {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 }
  });

  res.json({ jobId, status: "queued" });
});

app.get("/jobs/:id", async (req, res) => {
  const [rows] = await pool.query(`SELECT * FROM import_jobs WHERE id = ?`, [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "not found" });
  res.json(rows[0]);
});

// Required by assignment [file:1]
app.get("/images", async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, name,
            google_drive_id AS googleDriveId,
            size_bytes AS size,
            mime_type AS mimeType,
            storage_path AS storagePath,
            source,
            created_at AS createdAt
     FROM images
     ORDER BY id DESC
     LIMIT 500`
  );
  res.json(rows);
});

await initDb();
app.listen(4000, () => console.log("api-service running on 4000"));
