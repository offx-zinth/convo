'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LandingPage() {
  const [captchaUrl, setCaptchaUrl] = useState('/api/auth/captcha');
  const [captchaText, setCaptchaText] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [senderName, setSenderName] = useState('User 1');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const refreshCaptcha = () => {
    setCaptchaUrl(`/api/auth/captcha?t=${Date.now()}`);
    setCaptchaText('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          captcha: captchaText,
          secret: secretCode,
          senderName,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/chat');
      } else {
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          setError(data.error || 'Login failed');
          refreshCaptcha();
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Private Chat</h1>
          <p className="text-slate-400">Secure access only for invited members</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Who are you?
            </label>
            <select
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>User 1</option>
              <option>User 2</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Secret Code
            </label>
            <input
              type="password"
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              placeholder="Enter 4-5 digit code"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Verify you are human
            </label>
            <div className="flex items-center space-x-4 mb-2 bg-white rounded-lg p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={captchaUrl}
                alt="captcha"
                className="h-12 flex-1 object-contain"
              />
              <button
                type="button"
                onClick={refreshCaptcha}
                className="text-slate-600 hover:text-blue-600 p-2"
              >
                ↻
              </button>
            </div>
            <input
              type="text"
              value={captchaText}
              onChange={(e) => setCaptchaText(e.target.value)}
              placeholder="Enter CAPTCHA text"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Enter Secure Chat'}
          </button>
        </form>
      </div>
    </div>
  );
}
