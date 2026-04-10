'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const shimmer =
  'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-dark-500/30 before:to-transparent';

export function SkeletonBox({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn('rounded-xl bg-dark-700', shimmer, className)}
    />
  );
}

export function SkeletonCircle({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn('rounded-full bg-dark-700', shimmer, className)}
      style={{ width: size, height: size }}
    />
  );
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-3 rounded bg-dark-700',
            shimmer,
            i === lines - 1 && 'w-3/4',
          )}
        />
      ))}
    </div>
  );
}

export function VideoCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Thumbnail */}
      <SkeletonBox className="aspect-video w-full" />
      {/* Info row */}
      <div className="flex gap-3">
        <SkeletonCircle size={36} className="shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonBox className="h-4 w-full" />
          <SkeletonBox className="h-3 w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function ProfileCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center space-y-3 p-6', className)}>
      <SkeletonCircle size={80} />
      <SkeletonBox className="h-5 w-32" />
      <SkeletonBox className="h-3 w-48" />
      <div className="flex gap-6 pt-2">
        <SkeletonBox className="h-8 w-16" />
        <SkeletonBox className="h-8 w-16" />
        <SkeletonBox className="h-8 w-16" />
      </div>
    </div>
  );
}
