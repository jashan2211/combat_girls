'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/store';
import { authAPI } from '@/lib/api';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

const GOOGLE_CLIENT_ID = '1087229679266-e7c9aq70iukgvbaijo3fjb5l6pdopft9.apps.googleusercontent.com';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { setToken, setUser } = useAuthStore();

  const handleGoogleResponse = useCallback(async (response: any) => {
    if (!response.credential) {
      setError('Google sign-in was cancelled.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const googleRes = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await googleRes.json();
      if (data.success && data.data) {
        setToken(data.data.token);
        setUser(data.data.user);
        window.location.href = '/';
      } else {
        setError(data.message || 'Google sign-in failed');
      }
    } catch {
      setError('Google sign-in failed. Please try again.');
    }
    setLoading(false);
  }, [setToken, setUser]);

  const [googleLoaded, setGoogleLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => setGoogleLoaded(true);
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, []);

  useEffect(() => {
    if (!googleLoaded || typeof window === 'undefined') return;
    const g = (window as any).google;
    if (!g) return;
    g.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
      ux_mode: 'popup',
    });
    const btn = document.getElementById('google-signin-btn');
    if (btn) {
      g.accounts.id.renderButton(btn, {
        theme: 'filled_black',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        width: 350,
      });
    }
  }, [googleLoaded, handleGoogleResponse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await authAPI.login({ email, password });
      const { token, user } = res.data.data || res.data;
      setToken(token);
      setUser(user);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-red/5 via-dark-900 to-brand-gold/5" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl font-bold text-gradient mb-2">COMBAT GIRLS</h1>
          <p className="text-dark-200">Women&apos;s Combat Sports TV</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <h2 className="text-xl font-semibold text-center mb-6">Sign in to your account</h2>

          {/* Google Sign In - rendered by Google Identity Services */}
          <div id="google-signin-btn" className="w-full flex justify-center mb-4" />

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-dark-600" />
            <span className="text-dark-300 text-sm">or</span>
            <div className="flex-1 h-px bg-dark-600" />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-brand-red/10 border border-brand-red/30 text-brand-red-light text-sm p-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" size={18} />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-300 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-dark-200">
                <input type="checkbox" className="rounded border-dark-500 bg-dark-700 text-brand-red focus:ring-brand-red" />
                Remember me
              </label>
              <a href="#" className="text-brand-red hover:text-brand-red-light">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-dark-200 text-sm mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-brand-red hover:text-brand-red-light font-medium">
              Sign up
            </Link>
          </p>

          <div className="text-center mt-4">
            <Link href="/" className="text-dark-300 hover:text-white text-sm transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
