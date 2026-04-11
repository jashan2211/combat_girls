'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/store';
import { authAPI } from '@/lib/api';
import Link from 'next/link';
import { User, Mail, Lock, Eye, EyeOff, Shield, Trophy } from 'lucide-react';

const GOOGLE_CLIENT_ID = '1087229679266-e7c9aq70iukgvbaijo3fjb5l6pdopft9.apps.googleusercontent.com';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'fan' as 'fan' | 'athlete',
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleResponse = useCallback(async (response: any) => {
    if (!response.credential) return;
    setLoading(true);
    setError('');
    try {
      const apiUrl = typeof window !== 'undefined' && window.location.origin.includes('combatgirls.net')
        ? 'https://combatgirls.net/api'
        : 'http://localhost:5000/api';
      const googleRes = await fetch(`${apiUrl}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await googleRes.json();
      if (data.success && data.data) {
        const { setToken, setUser } = useAuthStore.getState();
        setToken(data.data.token);
        setUser(data.data.user);
        window.location.href = '/';
      } else {
        setError(data.message || 'Google sign-up failed');
      }
    } catch {
      setError('Google sign-up failed. Please try again.');
    }
    setLoading(false);
  }, []);

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
    const btn = document.getElementById('google-signup-btn');
    if (btn) {
      g.accounts.id.renderButton(btn, {
        theme: 'filled_black',
        size: 'large',
        text: 'signup_with',
        shape: 'pill',
        width: 350,
      });
    }
  }, [googleLoaded, handleGoogleResponse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!form.agreeTerms) {
      setError('You must agree to the Terms of Service');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      const { token, user } = res.data.data || res.data;
      const { setToken, setUser } = useAuthStore.getState();
      setToken(token);
      setUser(user);
      window.location.href = form.role === 'athlete' ? '/profile/me' : '/';
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-red/5 via-dark-900 to-brand-gold/5" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl font-bold text-gradient mb-2">COMBAT GIRLS</h1>
          <p className="text-dark-200">Join the community</p>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-semibold text-center mb-6">Create your account</h2>

          {/* Google Sign Up - rendered by Google Identity Services */}
          <div id="google-signup-btn" className="w-full flex justify-center mb-4" />

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

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setForm({ ...form, role: 'fan' })}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                form.role === 'fan'
                  ? 'border-brand-red bg-brand-red/10'
                  : 'border-dark-500 hover:border-dark-400'
              }`}
            >
              <User size={24} className={form.role === 'fan' ? 'text-brand-red' : 'text-dark-200'} />
              <span className={`text-sm font-medium ${form.role === 'fan' ? 'text-white' : 'text-dark-200'}`}>
                I&apos;m a Fan
              </span>
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, role: 'athlete' })}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                form.role === 'athlete'
                  ? 'border-brand-gold bg-brand-gold/10'
                  : 'border-dark-500 hover:border-dark-400'
              }`}
            >
              <Trophy size={24} className={form.role === 'athlete' ? 'text-brand-gold' : 'text-dark-200'} />
              <span className={`text-sm font-medium ${form.role === 'athlete' ? 'text-white' : 'text-dark-200'}`}>
                I&apos;m an Athlete
              </span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" size={18} />
              <input
                type="text"
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field pl-10"
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" size={18} />
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field pl-10"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field pl-10 pr-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-300 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" size={18} />
              <input
                type="password"
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="input-field pl-10"
                required
              />
            </div>

            <label className="flex items-start gap-2 text-sm text-dark-200">
              <input
                type="checkbox"
                checked={form.agreeTerms}
                onChange={(e) => setForm({ ...form, agreeTerms: e.target.checked })}
                className="mt-0.5 rounded border-dark-500 bg-dark-700 text-brand-red focus:ring-brand-red"
              />
              <span>
                I agree to the{' '}
                <a href="#" className="text-brand-red hover:text-brand-red-light">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-brand-red hover:text-brand-red-light">Privacy Policy</a>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-dark-200 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-red hover:text-brand-red-light font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
