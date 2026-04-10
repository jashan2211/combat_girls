import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';
import { Providers } from './providers';
import { WebsiteJsonLd, OrganizationJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://combatgirls.tv';
const SITE_NAME = 'COMBAT GIRLS';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0A0A0A',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'COMBAT GIRLS - Women\'s Combat Sports TV | MMA, Boxing, BJJ, Muay Thai',
    template: '%s | COMBAT GIRLS',
  },
  description: 'The premier streaming platform for women\'s combat sports. Watch MMA fights, boxing matches, BJJ, Muay Thai and more. Follow top female athletes, watch highlights and live events.',
  keywords: [
    'women combat sports', 'female mma', 'women\'s mma', 'women boxing',
    'female fighters', 'women muay thai', 'women bjj', 'female jiu jitsu',
    'women ufc', 'wmma', 'women wrestling', 'combat girls',
    'fight pass', 'women\'s kickboxing', 'female athletes',
    'mma streaming', 'fight highlights', 'combat sports tv',
  ],
  authors: [{ name: 'Combat Girls' }],
  creator: 'Combat Girls',
  publisher: 'Combat Girls',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'COMBAT GIRLS - Women\'s Combat Sports TV',
    description: 'Watch the best women\'s MMA, boxing, BJJ, and combat sports. Stream fights, follow athletes, and join the community.',
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'COMBAT GIRLS - Women\'s Combat Sports TV',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'COMBAT GIRLS - Women\'s Combat Sports TV',
    description: 'Stream the best women\'s MMA, boxing, BJJ and combat sports.',
    images: ['/og-image.png'],
    creator: '@combat_girls',
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  category: 'sports',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <WebsiteJsonLd />
        <OrganizationJsonLd />
        {/* Google AdSense - replace ca-pub-XXXXX with your actual publisher ID */}
        <meta name="google-adsense-account" content="ca-pub-XXXXX" />
        {/* Google Search Console verification - replace with your actual code */}
        <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
      </head>
      <body className="font-sans min-h-screen bg-dark-900">
        <Providers>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#1A1A1A',
                color: '#fff',
                border: '1px solid #2E2E2E',
                borderRadius: '12px',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
