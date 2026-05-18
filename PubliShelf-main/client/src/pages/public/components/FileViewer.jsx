import React, { useMemo, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

const getQuery = (search) => {
  const params = new URLSearchParams(search);
  return {
    url: params.get('url') || '',
    title: params.get('title') || 'File Viewer',
  };
};

const getType = (u) => {
  const clean = (u || '').split('?')[0].split('#')[0];
  const ext = (clean.split('.').pop() || '').toLowerCase();
  if (["jpg","jpeg","png","webp","gif","svg","bmp","avif"].includes(ext)) return 'image';
  if (["mp4","webm","ogg","mov","m4v"].includes(ext)) return 'video';
  if (ext === 'pdf') return 'pdf';
  return 'file';
};

const FileViewer = () => {
  const { search } = useLocation();
  const { url, title } = useMemo(() => getQuery(search), [search]);
  const type = getType(url);
  const [error, setError] = useState(false);
  const backendBase = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000');
  const proxied = `${backendBase}/api/files/proxy?url=${encodeURIComponent(url)}`;

  const download = () => {
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = '';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {}
  };

  if (!url) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-700 mb-4">No file URL provided</p>
          <Link to="/" className="text-purple-600 underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900 truncate">{title}</h1>
          <div className="flex gap-2">
            <button onClick={download} className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm">
              <i className="fas fa-download mr-1"></i>
              Download
            </button>
            <a href={url} target="_blank" rel="noreferrer" className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-100">
              Open Original
            </a>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 p-3 min-h-[70vh] flex items-center justify-center">
          {!error && type === 'image' && (
            <img src={url} alt={title} className="object-contain min-h-[70vh]" onError={() => setError(true)} />
          )}
          {!error && type === 'video' && (
            <video src={proxied} controls className="w-full min-h-[70vh] bg-black" onError={() => setError(true)} />
          )}
          {!error && type === 'pdf' && (
            <iframe
              src={proxied}
              title={title}
              className="w-full h-[75vh] bg-white"
              onError={() => setError(true)}
            />
          )}
          {!error && type === 'file' && (
            <div className="text-center text-gray-600">
              <i className="fas fa-file text-4xl mb-2"></i>
              <p>Preview not available for this file type.</p>
              <p className="text-sm mt-1">Use Download or Open Original.</p>
            </div>
          )}

          {error && (
            <div className="text-center text-gray-700">
              <p className="mb-3">Preview failed to load.</p>
              <div className="flex items-center justify-center gap-2">
                <button
                  className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                  onClick={() => {
                    setError(false);
                  }}
                >
                  Retry
                </button>
                <a href={url} target="_blank" rel="noreferrer" className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-100">
                  Open Original
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4">
          <Link to="/" className="text-purple-600 underline">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default FileViewer;
