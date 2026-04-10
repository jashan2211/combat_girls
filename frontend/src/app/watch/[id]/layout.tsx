import type { Metadata } from 'next';

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const videoId = params.id;
  const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return {
    title: `Watch Fight Video | COMBAT GIRLS`,
    description: 'Watch women\'s combat sports videos — MMA fights, BJJ matches, boxing, Muay Thai highlights and more on COMBAT GIRLS.',
    openGraph: {
      title: 'Watch Fight Video | COMBAT GIRLS',
      description: 'Women\'s combat sports video on COMBAT GIRLS',
      images: [thumbnail],
      type: 'video.other',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Watch Fight Video | COMBAT GIRLS',
      images: [thumbnail],
    },
    alternates: {
      canonical: `/watch/${videoId}`,
    },
  };
}

export default function WatchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
