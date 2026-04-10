'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export default function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  const tabsRef = React.useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = React.useState({ left: 0, width: 0 });

  React.useEffect(() => {
    const container = tabsRef.current;
    if (!container) return;

    const activeElement = container.querySelector<HTMLButtonElement>(
      `[data-tab-id="${activeTab}"]`,
    );
    if (activeElement) {
      setIndicatorStyle({
        left: activeElement.offsetLeft,
        width: activeElement.offsetWidth,
      });
    }
  }, [activeTab]);

  return (
    <div className={cn('relative', className)}>
      <div
        ref={tabsRef}
        className="flex overflow-x-auto no-scrollbar border-b border-dark-600"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            data-tab-id={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors shrink-0',
              activeTab === tab.id
                ? 'text-white'
                : 'text-dark-200 hover:text-dark-100',
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'ml-1 px-1.5 py-0.5 rounded-full text-xs',
                  activeTab === tab.id
                    ? 'bg-brand-red/20 text-brand-red-light'
                    : 'bg-dark-600 text-dark-200',
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Active indicator */}
      <div
        className="absolute bottom-0 h-0.5 bg-brand-red transition-all duration-200 ease-out"
        style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
      />
    </div>
  );
}
