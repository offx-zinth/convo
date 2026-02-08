'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@prisma/client';
import MessageBubble from './MessageBubble';

export default function MessageList({ messages, currentUser }: { messages: Message[], currentUser: any }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"
    >
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
          <p className="bg-slate-800 px-4 py-2 rounded-full text-sm">No messages yet. Start the conversation.</p>
        </div>
      )}
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isOwn={msg.senderId === currentUser.userId}
        />
      ))}
    </div>
  );
}
