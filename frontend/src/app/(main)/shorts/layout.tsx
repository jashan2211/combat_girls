import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Combat Sports Shorts - Quick Fight Clips & Knockout Highlights',
  description: 'Watch short-form women\'s combat sports clips. Knockouts, submissions, highlights from MMA, BJJ, boxing and more. Swipe through the best moments.',
  keywords: ['combat sports shorts', 'fight clips', 'mma shorts', 'knockout highlights', 'bjj highlights', 'women fighters'],
  openGraph: {
    title: 'Combat Sports Shorts | COMBAT GIRLS',
    description: 'Quick fight clips and highlights from women\'s combat sports',
  },
  alternates: { canonical: '/shorts' },
};

export default function ShortsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
