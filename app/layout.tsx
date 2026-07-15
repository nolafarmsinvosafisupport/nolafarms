import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter, Playfair_Display } from 'next/font/google';
import Script from 'next/script';
import '@/styles/globals.css';
import { ConditionalFooter } from '@/components/layout/ConditionalFooter';
import { Navbar } from '@/components/layout/Navbar';
import { CartProvider } from '@/lib/cart-context';
import { NotificationProvider } from '@/lib/notification-context';
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
  display: 'swap',
  preload: true,
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  icons: {
    icon: [{ url: '/images/logos/favicon.png', type: 'image/png' }],
    apple: [{ url: '/images/logos/favicon.png' }],
    shortcut: '/images/logos/favicon.png',
  },
  title: {
    default: 'Nola Ranches | Quality Livestock & Trusted Genetics in Kenya',
    template: '%s | Nola Ranches',
  },
  description:
    'Nola Ranches raises quality livestock with trusted genetics in Kenya — Boran, Girolando and Holstein cattle, Boer and Galla goats, Dorper sheep, and Large White, Landrace, Duroc and Pietrain pigs. Vaccinated, dewormed and farm-ready.',
  keywords: [
    'Nola Ranches',
    'livestock for sale Kenya',
    'buy cattle Kenya',
    'buy goats Kenya',
    'buy pigs Kenya',
    'sheep for sale Kenya',
    'dairy cattle Kenya',
    'beef cattle Kenya',
    'breeding stock Kenya',
    'boar services Kenya',
    'livestock Oloitoktok',
    'livestock Laikipia',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    siteName: 'Nola Ranches',
    title: 'Nola Ranches | Quality Livestock & Trusted Genetics in Kenya',
    description:
      'Quality livestock and trusted genetics — cattle, goats, sheep and pigs raised in Oloitoktok and Laikipia, Kenya. Vaccinated, dewormed and farm-ready.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Nola Ranches livestock — cattle, goats, sheep and pigs in Kenya' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nola Ranches | Quality Livestock, Kenya',
    description: 'Quality livestock and trusted genetics — cattle, goats, sheep and pigs in Oloitoktok & Laikipia, Kenya.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  verification: SITE.googleVerification.startsWith('PLACEHOLDER')
    ? undefined
    : { google: SITE.googleVerification },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaEnabled = !SITE.googleAnalyticsId.startsWith('PLACEHOLDER');
  return (
    <ClerkProvider>
      <html lang="en-KE" className={`${inter.variable} ${playfair.variable}`}>
        <body className="font-sans">
          <NotificationProvider>
          <CartProvider>
          <JsonLd data={localBusinessSchema} />
          <ScrollProgressBar />
          <DustParticles />
          <Navbar />
          {children}
          <ConditionalFooter />
          <WhatsAppButton />
          {gaEnabled && (
            <>
              <Script src={`https://www.googletagmanager.com/gtag/js?id=${SITE.googleAnalyticsId}`} strategy="afterInteractive" />
              <Script id="google-analytics" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${SITE.googleAnalyticsId}');
                `}
              </Script>
            </>
          )}
          </CartProvider>
          </NotificationProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
