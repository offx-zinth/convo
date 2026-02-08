'use client';

import { useEffect, useState } from 'react';

export default function LinkPreview({ url }: { url: string }) {
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/link-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setPreview(data);
      })
      .finally(() => setLoading(false));
  }, [url]);

  if (loading || !preview) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block mt-2 bg-slate-900 rounded-lg overflow-hidden border border-slate-700 hover:border-slate-500 transition-colors"
    >
      {preview.images && preview.images[0] && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview.images[0]} alt="preview" className="w-full h-32 object-cover" />
      )}
      <div className="p-3">
        <h4 className="text-sm font-bold truncate">{preview.title}</h4>
        {preview.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mt-1">{preview.description}</p>
        )}
      </div>
    </a>
  );
}
