'use client';

import React from 'react';
import { CheckCircle } from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-20 w-20 text-xl',
} as const;

const indicatorSizeMap = {
  sm: 'h-2.5 w-2.5 border',
  md: 'h-3 w-3 border-2',
  lg: 'h-3.5 w-3.5 border-2',
  xl: 'h-4 w-4 border-2',
} as const;

const badgeSizeMap = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
  xl: 'h-6 w-6',
} as const;

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: keyof typeof sizeMap;
  online?: boolean;
  verified?: boolean;
  className?: string;
}

export default function Avatar({
  src,
  name,
  size = 'md',
  online,
  verified,
  className,
}: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      {src && !imgError ? (
        <img
          src={src}
          alt={name}
          onError={() => setImgError(true)}
          className={cn(
            'rounded-full object-cover',
            sizeMap[size],
          )}
        />
      ) : (
        <div
          className={cn(
            'rounded-full flex items-center justify-center bg-dark-600 text-dark-100 font-semibold select-none',
            sizeMap[size],
          )}
        >
          {getInitials(name)}
        </div>
      )}

      {online && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full bg-green-500 border-dark-800',
            indicatorSizeMap[size],
          )}
        />
      )}

      {verified && (
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 text-brand-gold',
          )}
        >
          <CheckCircle className={cn('fill-brand-gold text-dark-800', badgeSizeMap[size])} />
        </span>
      )}
    </div>
  );
}
