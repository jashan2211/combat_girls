'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Play,
  PlusCircle,
  Calendar,
  User,
  Search,
  Bell,
  Compass,
  TrendingUp,
  Settings,
  Trophy,
  Target,
  Users,
  Flame,
  MoreHorizontal,
  ShieldCheck,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '@/components/ui/Avatar';
import { useAuthStore, useNotificationStore } from '@/lib/store';

const bottomNavItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/shorts', icon: Play, label: 'Shorts' },
  { href: '/upload', icon: PlusCircle, label: 'Upload', isUpload: true },
  { href: '/events', icon: Calendar, label: 'Events' },
  { href: '#more', icon: MoreHorizontal, label: 'More', isMore: true },
];

const moreMenuItems = [
  { href: '/explore', icon: Compass, label: 'Explore' },
  { href: '/rankings', icon: Trophy, label: 'Rankings' },
  { href: '/predict', icon: Target, label: 'Predict' },
  { href: '/community', icon: Users, label: 'Community' },
  { href: '/profile/me', icon: User, label: 'Profile' },
  { href: '/admin', icon: ShieldCheck, label: 'Admin' },
];

const sidebarNavItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/shorts', icon: Play, label: 'Shorts' },
  { href: '/explore', icon: Compass, label: 'Explore' },
  { href: '/rankings', icon: Trophy, label: 'Rankings' },
  { href: '/predict', icon: Target, label: 'Predict' },
  { href: '/community', icon: Users, label: 'Community' },
  { href: '/events', icon: Calendar, label: 'Events' },
  { href: '/upload', icon: PlusCircle, label: 'Upload' },
  { href: '/profile/me', icon: User, label: 'Profile' },
];

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-dark-600">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/" className="flex items-center gap-1">
            <span className="font-display text-xl font-bold text-gradient tracking-wider">
              COMBAT GIRLS
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/explore"
              className="p-2 rounded-full hover:bg-dark-700 transition-colors"
            >
              <Search className="h-5 w-5 text-dark-100" />
            </Link>

            <button className="relative p-2 rounded-full hover:bg-dark-700 transition-colors">
              <Bell className="h-5 w-5 text-dark-100" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-4 min-w-[16px] px-1 bg-brand-red text-white text-[10px] font-bold rounded-full">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {user ? (
              <Link href="/profile/me" className="ml-1">
                <Avatar
                  src={user?.image}
                  name={user?.name || 'User'}
                  size="sm"
                />
              </Link>
            ) : (
              <Link
                href="/login"
                className="ml-1 px-4 py-1.5 bg-brand-red text-white text-sm font-semibold rounded-lg hover:bg-brand-red-dark transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-14 bottom-0 w-56 flex-col bg-dark-800 border-r border-dark-600 z-40">
        <nav className="flex-1 py-4 px-3 space-y-1">
          {sidebarNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-brand-red/10 text-brand-red'
                    : 'text-dark-100 hover:bg-dark-700 hover:text-white'
                )}
              >
                <item.icon
                  className={cn('h-5 w-5', active && 'text-brand-red')}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-dark-600">
          <Link
            href="/admin"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
              isActive('/admin')
                ? 'bg-brand-red/10 text-brand-red'
                : 'text-dark-100 hover:bg-dark-700 hover:text-white'
            )}
          >
            <ShieldCheck className={cn('h-5 w-5', isActive('/admin') && 'text-brand-red')} />
            Admin
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          'pt-14 pb-20 lg:pb-0 lg:pl-56 min-h-screen'
        )}
      >
        {children}
      </main>

      {/* More Menu Slide-up Sheet */}
      {moreMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMoreMenuOpen(false)}
          />
          {/* Sheet */}
          <div className="absolute bottom-16 left-0 right-0 bg-dark-800 border-t border-dark-600 rounded-t-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <h3 className="text-sm font-semibold text-dark-100">More</h3>
              <button
                onClick={() => setMoreMenuOpen(false)}
                className="p-1.5 rounded-full hover:bg-dark-700 transition-colors"
              >
                <X className="h-4 w-4 text-dark-300" />
              </button>
            </div>
            <nav className="px-3 pb-4 grid grid-cols-3 gap-1">
              {moreMenuItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreMenuOpen(false)}
                    className={cn(
                      'flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl min-h-[72px] transition-colors',
                      active
                        ? 'bg-brand-red/10 text-brand-red'
                        : 'text-dark-200 hover:bg-dark-700 hover:text-white'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Bottom Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-dark-600">
        <div className="flex items-center justify-around h-16 px-2">
          {bottomNavItems.map((item) => {
            const active = isActive(item.href);

            if (item.isUpload) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center -mt-4"
                >
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-brand-red shadow-lg shadow-brand-red/30">
                    <PlusCircle className="h-6 w-6 text-white" />
                  </div>
                </Link>
              );
            }

            if (item.isMore) {
              return (
                <button
                  key="more-btn"
                  onClick={() => setMoreMenuOpen((v) => !v)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[44px] py-1 transition-colors',
                    moreMenuOpen ? 'text-brand-red' : 'text-dark-200'
                  )}
                >
                  <MoreHorizontal className="h-5 w-5" />
                  <span className="text-[10px] font-medium">More</span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[44px] py-1 transition-colors',
                  active ? 'text-brand-red' : 'text-dark-200'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
