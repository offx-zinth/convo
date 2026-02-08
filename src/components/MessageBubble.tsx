'use client';

import { Message } from '@prisma/client';
import { format } from 'date-fns';
import { FileText, Image as ImageIcon, Video, Download, Check, CheckCheck } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import LinkPreview from './LinkPreview';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function MessageBubble({ message, isOwn }: { message: Message, isOwn: boolean }) {
  const time = format(new Date(message.createdAt), 'HH:mm');

  const renderContent = () => {
    switch (message.type) {
      case 'IMAGE':
        return (
          <div className="space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={message.fileUrl!}
              alt={message.fileName || 'Image'}
              className="max-w-full rounded-lg border border-slate-700 max-h-96 object-cover"
            />
            {message.content && <p className="text-sm">{message.content}</p>}
          </div>
        );
      case 'VIDEO':
        return (
          <div className="space-y-2">
            <video
              src={message.fileUrl!}
              controls
              className="max-w-full rounded-lg border border-slate-700 max-h-96"
            />
            {message.content && <p className="text-sm">{message.content}</p>}
          </div>
        );
      case 'DOCUMENT':
        return (
          <a
            href={message.fileUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 bg-slate-900/50 p-3 rounded-lg border border-slate-700 hover:bg-slate-900 transition-colors"
          >
            <div className="bg-blue-600 p-2 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{message.fileName}</p>
              <p className="text-xs text-slate-400">{(message.fileSize! / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <Download className="w-5 h-5 text-slate-400" />
          </a>
        );
      default:
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urls = message.content?.match(urlRegex);
        return (
          <div className="space-y-2">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
            {urls && urls.map((url, i) => <LinkPreview key={i} url={url} />)}
          </div>
        );
    }
  };

  return (
    <div className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}>
      <div className={cn(
        "max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2 shadow-md relative",
        isOwn
          ? "bg-blue-600 text-white rounded-tr-none"
          : "bg-slate-800 text-slate-100 rounded-tl-none"
      )}>
        {!isOwn && (
          <p className="text-[10px] font-bold text-blue-400 mb-1 uppercase tracking-wider">
            {message.senderName}
          </p>
        )}
        {renderContent()}
        <div className={cn(
          "flex items-center justify-end space-x-1 mt-1",
          isOwn ? "text-blue-200" : "text-slate-500"
        )}>
          <span className="text-[10px]">{time}</span>
          {isOwn && (
            message.status === 'read'
              ? <CheckCheck className="w-3 h-3 text-cyan-300" />
              : <Check className="w-3 h-3" />
          )}
        </div>
      </div>
    </div>
  );
}
