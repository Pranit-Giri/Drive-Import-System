"use client";

import { useEffect, useState } from "react";
import { getImages } from "../../lib/api";

export default function ImagesPage() {
  const [images, setImages] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getImages();
        setImages(data);
      } catch (e) {
        setErr(String(e));
      }
    })();
  }, []);

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Images</h1>
        <a className="btn btn-secondary" href="/">
          Back
        </a>
      </div>

      {err ? <p className="text-rose-400 text-sm">{err}</p> : null}

      <div className="grid-cards">
        {images.map((img) => (
          <div key={img.id} className="img-tile">
            <img src={img.storagePath} alt={img.name} />
            <div className="p-3 text-sm text-slate-200 break-words">
              {img.name}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
