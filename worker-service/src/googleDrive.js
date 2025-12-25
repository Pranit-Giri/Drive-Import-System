import axios from "axios";

function extractFolderId(folderUrl) {
  const m = folderUrl.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

export async function listDriveImages(folderUrl, apiKey) {
  const folderId = extractFolderId(folderUrl);
  if (!folderId) throw new Error("Could not parse folderId from folderUrl");

  let pageToken = undefined;
  const all = [];

  while (true) {
    const params = {
      key: apiKey,
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`,
      fields: "nextPageToken, files(id,name,mimeType,size)",
      pageSize: 1000,
      ...(pageToken ? { pageToken } : {})
    };

    const res = await axios.get("https://www.googleapis.com/drive/v3/files", { params });
    all.push(...(res.data.files || []));
    pageToken = res.data.nextPageToken;
    if (!pageToken) break;
  }

  return all;
}

export async function downloadDriveFileStream(fileId, apiKey) {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
  const res = await axios.get(url, { responseType: "stream" });
  return res.data;
}
