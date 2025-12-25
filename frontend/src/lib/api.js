const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export async function startImport(folderUrl) {
  const res = await fetch(`${API_BASE}/importgoogle-drive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folderUrl }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getJob(jobId) {
  const res = await fetch(`${API_BASE}/jobs/${jobId}`, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getImages() {
  const res = await fetch(`${API_BASE}/images`, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
