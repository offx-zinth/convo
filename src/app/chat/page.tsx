'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { pusherClient } from '@/lib/pusher-client';
import { Message } from '@prisma/client';
import ChatHeader from '@/components/ChatHeader';
import MessageList from '@/components/MessageList';
import MessageInput from '@/components/MessageInput';

export const dynamic = 'force-dynamic';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 1. Session check
  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((data) => {
        setCurrentUser(data.user);
      })
      .catch(() => {
        router.push('/');
      });
  }, [router]);

  // 2. Data and Real-time
  useEffect(() => {
    if (!currentUser) return;

    const fetchMessages = () => {
      fetch('/api/messages')
        .then((res) => res.json())
        .then((data) => {
          setMessages(data);
          setLoading(false);
        });
    };

    fetchMessages();
    fetch('/api/messages/status', { method: 'PUT' });

    const channel = pusherClient.subscribe('chat');
    channel.bind('new-message', (newMessage: Message) => {
      setMessages((prev) => [...prev, newMessage]);
      if (newMessage.senderId !== currentUser.userId) {
        fetch('/api/messages/status', { method: 'PUT' });
      }
    });

    channel.bind('status-update', () => {
      fetch('/api/messages')
        .then((res) => res.json())
        .then((data) => setMessages(data));
    });

    return () => {
      pusherClient.unsubscribe('chat');
    };
  }, [currentUser]);

  const handleSendMessage = async (content: string, type: string = 'TEXT', fileData?: any) => {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          type,
          ...fileData,
        }),
      });
      if (!res.ok) throw new Error('Failed to send message');
    } catch (err) {
      console.error(err);
      alert('Failed to send message');
    }
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading secure chat...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100">
      <ChatHeader user={currentUser} />
      <MessageList messages={messages} currentUser={currentUser} />
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
}
