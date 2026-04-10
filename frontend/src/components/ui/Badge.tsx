'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const variantStyles = {
  red: 'bg-brand-red/20 text-brand-red-light',
  gold: 'bg-brand-gold/20 text-brand-gold-light',
  green: 'bg-green-500/20 text-green-400',
  blue: 'bg-blue-500/20 text-blue-400',
  gray: 'bg-dark-600 text-dark-100',
  live: 'bg-brand-red text-white animate-pulse-red',
} as const;

interface BadgeProps {
  variant?: keyof typeof variantStyles;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export default function Badge({
  variant = 'gray',
  children,
  className,
  dot,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            variant === 'live' ? 'bg-white' : 'bg-current',
          )}
        />
      )}
      {children}
    </span>
  );
}
