import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fighter Rankings - Vote for Your Favorite Women\'s Combat Sports Athletes',
  description: 'Vote in head-to-head matchups and rank the best female MMA fighters, boxers, BJJ athletes. Community-driven rankings updated in real time.',
  keywords: ['fighter rankings', 'women mma rankings', 'female fighter rankings', 'p4p rankings', 'combat sports poll'],
  openGraph: {
    title: 'Fighter Rankings | COMBAT GIRLS',
    description: 'Vote and rank the best women\'s combat sports athletes',
  },
  alternates: { canonical: '/rankings' },
};

export default function RankingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
