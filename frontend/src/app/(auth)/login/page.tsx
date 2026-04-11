'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setToken, setUser } = useAuthStore();

  // Check for Google OAuth callback token in URL
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userData = params.get('user');
    if (token && userData) {
      try {
        const user = JSON.parse(decodeURIComponent(userData));
        setToken(token);
        setUser(user);
        window.location.href = '/';
      } catch {
        setError('Google sign-in failed. Invalid response.');
      }
    }
    const err = params.get('error');
    if (err) setError(decodeURIComponent(err));
  }, [setToken, setUser]);

  const handleGoogleSignIn = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = '/api/auth/google/redirect';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setToken(data.data.token);
        setUser(data.data.user);
        window.location.href = '/';
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-red/5 via-dark-900 to-brand-gold/5" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl font-bold text-gradient mb-2">COMBAT GIRLS</h1>
          <p className="text-dark-200">Women&apos;s Combat Sports TV</p>
        </div>
        <div className="card p-8">
          <h2 className="text-xl font-semibold text-center mb-6">Sign in to your account</h2>

          {/* Google Sign In - redirect flow */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white text-dark-900 font-medium py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-dark-600" />
            <span className="text-dark-300 text-sm">or</span>
            <div className="flex-1 h-px bg-dark-600" />
          </div>

          {error && (
            <div className="bg-brand-red/10 border border-brand-red/30 text-brand-red-light text-sm p-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" size={18} />
              <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-10" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" size={18} />
              <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-10 pr-10" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-300 hover:text-white">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-dark-200 text-sm mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-brand-red hover:text-brand-red-light font-medium">Sign up</Link>
          </p>
          <div className="text-center mt-4">
            <Link href="/" className="text-dark-300 hover:text-white text-sm transition-colors">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
