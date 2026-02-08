'use client';

import { useState, useRef } from 'react';
import { Send, Paperclip, X, Image as ImageIcon, FileText, Film } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface MessageInputProps {
  onSendMessage: (content: string, type?: string, fileData?: any) => Promise<void>;
}

export default function MessageInput({ onSendMessage }: MessageInputProps) {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(selectedFile));
      } else {
        setPreview(null);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    maxFiles: 1,
  });

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!text.trim() && !file) || uploading) return;

    setUploading(true);
    try {
      let fileData = {};
      let type = 'TEXT';

      if (file) {
        // 1. Get presigned URL
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size
          }),
        });
        const { uploadUrl, fileUrl } = await res.json();

        // 2. Upload to S3
        await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });

        fileData = {
          fileUrl,
          fileName: file.name,
          fileSize: file.size,
        };

        if (file.type.startsWith('image/')) type = 'IMAGE';
        else if (file.type.startsWith('video/')) type = 'VIDEO';
        else type = 'DOCUMENT';
      }

      await onSendMessage(text, type, fileData);
      setText('');
      setFile(null);
      setPreview(null);
    } catch (err) {
      console.error(err);
      alert('Failed to send message');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 bg-slate-800 border-t border-slate-700">
      {file && (
        <div className="mb-4 p-3 bg-slate-900 rounded-lg flex items-center justify-between border border-slate-700 animate-in slide-in-from-bottom-2">
          <div className="flex items-center space-x-3 overflow-hidden">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="preview" className="w-12 h-12 rounded object-cover" />
            ) : file.type.startsWith('video/') ? (
              <Film className="w-8 h-8 text-blue-500" />
            ) : (
              <FileText className="w-8 h-8 text-blue-500" />
            )}
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <button
            onClick={() => { setFile(null); setPreview(null); }}
            className="p-1 hover:bg-slate-700 rounded-full text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <form {...getRootProps()} onSubmit={handleSubmit} className="flex items-end space-x-2">
        <input {...getInputProps()} />
        <button
          type="button"
          onClick={open}
          className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors text-slate-300"
        >
          <Paperclip className="w-6 h-6" />
        </button>

        <div className="flex-1 relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={isDragActive ? "Drop file here..." : "Type a message..."}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-32 min-h-[48px]"
            rows={1}
          />
        </div>

        <button
          type="submit"
          disabled={(!text.trim() && !file) || uploading}
          className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl transition-all text-white shadow-lg shadow-blue-900/20"
        >
          {uploading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-6 h-6" />
          )}
        </button>
      </form>
    </div>
  );
}
