'use client';

import { useRouter } from 'next/navigation';
import { LogOut, Shield, Circle } from 'lucide-react';

export default function ChatHeader({ user }: { user: any }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between shadow-lg z-10">
      <div className="flex items-center space-x-4">
        <div className="bg-blue-600 p-2 rounded-xl">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-lg leading-tight">Private Safe</h2>
          <div className="flex items-center text-xs text-green-400">
            <Circle className="w-2 h-2 fill-current mr-1" />
            <span>Encrypted Session</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden sm:block text-right mr-2">
          <p className="text-sm font-medium text-slate-200">{user.senderName}</p>
          <p className="text-xs text-slate-400">Online</p>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
