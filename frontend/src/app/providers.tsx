'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';

function AuthSync({ children }: { children: React.ReactNode }) {
  const { hydrate, setLoading, token, user, setUser, setToken } = useAuthStore();

  // Hydrate from localStorage after mount (prevents SSR/client mismatch)
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Fetch current user if we have a token but no user data
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    if (user) {
      setLoading(false);
      return;
    }
    // Fetch user from /api/auth/me
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data?.user) {
          setUser(data.data.user);
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(data.data.user));
          }
        } else {
          // Invalid token — clear it
          setToken(null);
          setUser(null);
        }
      })
      .catch(() => {
        // Network error — keep token but don't set user
      })
      .finally(() => setLoading(false));
  }, [token, user, setUser, setToken, setLoading]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthSync>{children}</AuthSync>;
}
