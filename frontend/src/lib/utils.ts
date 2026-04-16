import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Use a fixed reference date so server-build output matches client render.
// Prevents React hydration mismatches (#418/#423/#425).
// The date is updated on each build.
const REF_DATE = new Date('2026-04-16T12:00:00Z').getTime();

export function timeAgo(date: string | Date): string {
  const past = new Date(date).getTime();
  const seconds = Math.floor((REF_DATE - past) / 1000);

  if (seconds < 0) return 'just now';
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
  const months = Math.floor(seconds / 2592000);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const DISCIPLINES = [
  'MMA', 'Boxing', 'Muay Thai', 'BJJ', 'Wrestling', 'Kickboxing',
  'Judo', 'Karate', 'Taekwondo', 'Capoeira',
] as const;

export const WEIGHT_CLASSES = [
  'Strawweight (115)', 'Flyweight (125)', 'Bantamweight (135)',
  'Featherweight (145)', 'Lightweight (155)', 'Welterweight (170)',
  'Middleweight (185)', 'Light Heavyweight (205)', 'Heavyweight (265)',
  'Open Weight',
] as const;

export const SUBSCRIPTION_TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month' as const,
    features: ['Watch free fights', 'Follow athletes', 'Basic profiles', 'Limited shorts'],
    stripePriceId: '',
  },
  {
    id: 'bronze',
    name: 'Bronze',
    price: 4.99,
    interval: 'month' as const,
    features: ['All free features', 'HD streaming', 'Unlimited shorts', 'No ads', 'Comment on fights'],
    stripePriceId: 'price_bronze_monthly',
  },
  {
    id: 'silver',
    name: 'Silver',
    price: 9.99,
    interval: 'month' as const,
    features: ['All Bronze features', '4K streaming', 'Early access', 'Exclusive interviews', 'Fight predictions'],
    stripePriceId: 'price_silver_monthly',
  },
  {
    id: 'gold',
    name: 'Gold',
    price: 19.99,
    interval: 'month' as const,
    features: ['All Silver features', 'PPV events included', 'Behind the scenes', 'Direct message athletes', 'Priority support'],
    stripePriceId: 'price_gold_monthly',
  },
];
