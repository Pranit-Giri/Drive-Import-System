"use client";
import { useState } from "react";
import { startImport, getJob } from "../lib/api";

export default function Page() {
  const [folderUrl, setFolderUrl] = useState("");
  const [jobId, setJobId] = useState("");
  const [job, setJob] = useState(null);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    const data = await startImport(folderUrl);
    setJobId(data.jobId);
    setJob({ status: "queued" });
  }

  async function refresh() {
    if (!jobId) return;
    const j = await getJob(jobId);
    setJob(j);
  }

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Drive Image Import</h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full p-3 rounded bg-slate-900 border border-slate-700"
          placeholder="Paste public Google Drive folder URL"
          value={folderUrl}
          onChange={(e) => setFolderUrl(e.target.value)}
        />
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded bg-indigo-600" type="submit">
            Start Import
          </button>
          <button className="px-4 py-2 rounded bg-slate-800" type="button" onClick={refresh}>
            Refresh Status
          </button>
          <a className="px-4 py-2 rounded bg-slate-800" href="/images">
            View Images
          </a>
        </div>
      </form>

      {err ? <p className="text-red-400">{err}</p> : null}
      {jobId ? <p>Job ID: {jobId}</p> : null}

      {job ? (
        <div className="p-4 rounded bg-slate-900 border border-slate-800">
          <p>Status: {job.status}</p>
          <p>Total: {job.total_files}</p>
          <p>Processed: {job.processed_files}</p>
          <p>Failed: {job.failed_files}</p>
          {job.error ? <p className="text-red-400">Error: {job.error}</p> : null}
        </div>
      ) : null}
    </main>
  );
}
