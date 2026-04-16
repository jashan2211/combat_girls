'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function MyProfileRedirect() {
  const { user, isHydrated } = useAuthStore();
  const router = useRouter();
  const [message, setMessage] = useState('Loading your profile...');

  useEffect(() => {
    if (!isHydrated) return;

    if (!user) {
      setMessage('Redirecting to sign in...');
      router.replace('/login');
      return;
    }

    // Admin / Combat Girls channel owner → /profile/combat-girls
    if (user.role === 'admin' || user.email === 'combatgirlschannel@gmail.com') {
      router.replace('/profile/combat-girls');
      return;
    }

    // Regular users → their slug or fallback
    const slug = user.slug || user.email?.split('@')[0] || user._id;
    router.replace(`/profile/${slug}`);
  }, [isHydrated, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-dark-200">{message}</p>
      </div>
    </div>
  );
}
