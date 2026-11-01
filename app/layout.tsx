import type { Metadata, Viewport } from 'next';
import './globals.css';
import PwaRegistrar from '@/components/PwaRegistrar';
import PwaInstallPrompt from '@/components/PwaInstallPrompt';

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'RUDAFLIX - 全网高清无广告流媒体影视 (rudaflix.com)',
  description: 'RUDAFLIX (rudaflix.com) 官方流媒体影院，原生对接 Apple CMS V10，提供 4K 蓝光影视、无广告极速解析、剧集连播、全平台多端同步与沉浸式视听体验。',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'RUDAFLIX',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'RUDAFLIX - 全网高清无广告流媒体影视 (rudaflix.com)',
    description: 'RUDAFLIX (rudaflix.com) 官方流媒体影院，原生对接 Apple CMS V10，提供 4K 蓝光影视、无广告极速解析、剧集连播、全平台多端同步与沉浸式视听体验。',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RUDAFLIX - 全网高清无广告流媒体影视 (rudaflix.com)',
    description: 'RUDAFLIX (rudaflix.com) 官方流媒体影院，原生对接 Apple CMS V10，提供 4K 蓝光影视、无广告极速解析、剧集连播、全平台多端同步与沉浸式视听体验。',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="bg-[#000000] text-white min-h-screen antialiased selection:bg-[#E50914] selection:text-white" suppressHydrationWarning>
        <PwaRegistrar />
        {children}
        <PwaInstallPrompt />
      </body>
    </html>
  );
}
