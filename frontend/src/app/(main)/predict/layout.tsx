import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fight Predictor - Pick Winners for Upcoming Women\'s MMA Fights',
  description: 'Make your predictions for upcoming women\'s MMA and combat sports fights. Pick winners, choose methods, and compete with the community.',
  keywords: ['fight predictions', 'mma predictions', 'women mma picks', 'fight predictor', 'upcoming fights'],
  openGraph: {
    title: 'Fight Predictor | COMBAT GIRLS',
    description: 'Predict winners for upcoming women\'s combat sports fights',
  },
  alternates: { canonical: '/predict' },
};

export default function PredictLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
