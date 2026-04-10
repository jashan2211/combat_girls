'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import Button from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'gold';
  };
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className,
      )}
    >
      {icon && (
        <div className="mb-4 text-dark-300">{icon}</div>
      )}
      <h3 className="text-lg font-semibold text-dark-100">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-dark-200 max-w-sm">{description}</p>
      )}
      {action && (
        <div className="mt-6">
          <Button
            variant={action.variant || 'primary'}
            size="md"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
