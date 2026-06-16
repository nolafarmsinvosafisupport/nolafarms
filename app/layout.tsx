import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter, Playfair_Display } from 'next/font/google';
import Script from 'next/script';
import '@/styles/globals.css';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { WhatsAppButton } from '@/components/contact/WhatsAppButton';
import { DustParticles } from '@/components/ui/DustParticles';
import { JsonLd } from '@/components/ui/JsonLd';
import { ScrollProgressBar } from '@/components/ui/ScrollProgressBar';
import { SITE } from '@/lib/constants';
import { localBusinessSchema } from '@/lib/schema';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: 'Nola Farms | Large-Scale Farm & Livestock in Laikipia, Kenya',
    template: '%s | Nola Farms',
  },
  description:
    'Nola Farms is a 375-acre agricultural estate in Laikipia, Kenya, specialising in crop farming and exotic livestock breeding including cattle and goats. Book ranch visits and explore our farm.',
  keywords: [
    'Nola Farms',
    'farm Kenya',
    'Laikipia farm',
    'exotic livestock Kenya',
    'cattle farm Kenya',
    'goat farm Kenya',
    'wheat farming Kenya',
    'ranch visits Kenya',
    'farm tours Laikipia',
    'large scale farming Kenya',
    'agricultural farm Kenya',
    'buy livestock Kenya',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    siteName: 'Nola Farms',
    title: 'Nola Farms | Large-Scale Farm & Livestock in Laikipia, Kenya',
    description:
      'A 375-acre agricultural estate in Laikipia, Kenya. Crop farming, exotic cattle and goat breeds, and farm experiences.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Nola Farms - Laikipia, Kenya' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nola Farms | Laikipia, Kenya',
    description: 'Large-scale farm and exotic livestock in Laikipia, Kenya.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  verification: {
    google: SITE.googleVerification,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en-KE" className={`${inter.variable} ${playfair.variable}`}>
        <body className="font-sans">
          <JsonLd data={localBusinessSchema} />
          <ScrollProgressBar />
          <DustParticles />
          <Navbar />
          {children}
          <Footer />
          <WhatsAppButton />
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${SITE.googleAnalyticsId}`} strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${SITE.googleAnalyticsId}');
            `}
          </Script>
        </body>
      </html>
    </ClerkProvider>
  );
}
