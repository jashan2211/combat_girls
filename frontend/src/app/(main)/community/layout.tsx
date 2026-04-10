import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community - Women\'s Combat Sports Polls, Discussions & Predictions',
  description: 'Join the COMBAT GIRLS community. Vote in polls, discuss fights, share predictions, and connect with fellow women\'s combat sports fans.',
  keywords: ['combat sports community', 'mma forum', 'fight polls', 'women mma discussion', 'combat sports fans'],
  openGraph: {
    title: 'Community | COMBAT GIRLS',
    description: 'Join polls and discussions about women\'s combat sports',
  },
  alternates: { canonical: '/community' },
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
