import type { Metadata } from 'next';

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.id;
  const name = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    title: `${name} - Fighter Profile | Women's Combat Sports`,
    description: `${name} fighter profile on COMBAT GIRLS. View fight record, stats, highlights, and videos. Follow your favorite women's combat sports athlete.`,
    keywords: [name, 'fighter profile', 'women mma', 'female fighter', 'combat sports', 'fight record'],
    openGraph: {
      title: `${name} | COMBAT GIRLS`,
      description: `${name} - Women's combat sports athlete profile, fight record, and highlights.`,
      images: [`/fighters/${slug}.png`],
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title: `${name} | COMBAT GIRLS`,
      description: `${name} - Fighter profile and highlights`,
      images: [`/fighters/${slug}.png`],
    },
    alternates: {
      canonical: `/profile/${slug}`,
    },
  };
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
