'use client';

import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { authAPI } from '@/lib/api';

function AuthSync({ children }: { children: React.ReactNode }) {
  const { token, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    if (token) {
      authAPI
        .getMe()
        .then((res) => setUser(res.data.user))
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, setUser, setLoading]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthSync>{children}</AuthSync>
    </SessionProvider>
  );
}
