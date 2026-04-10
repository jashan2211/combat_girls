'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { User, Mail, Lock, Eye, EyeOff, Shield, Trophy } from 'lucide-react';

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      // Auto sign in after registration
      await signIn('credentials', {
        email: form.email,
        password: form.password,
        callbackUrl: form.role === 'athlete' ? '/profile/me' : '/',
      });
    } catch (err: any) {
      setError(err.message);
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

          {/* Google Sign Up */}
          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
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
