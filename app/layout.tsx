import type { Metadata } from 'next';
import './globals.css';
import './fonts.css';
import { Toaster } from 'sonner';
import { ScrollbarDetector } from './scrollbar-detector';

export const metadata: Metadata = {
  title: '관리 시스템',
  description: 'Supabase로 구현한 통합 관리 시스템',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="https://portal.algocare.me/favicon.ico" />
        {/* Preload fonts for better performance */}
        <link rel="preload" href="/fonts/Pretendard-SemiBold.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Pretendard-Regular.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Codec-Pro-Regular.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Codec-Pro-Bold.otf" as="font" type="font/otf" crossOrigin="anonymous" />
      </head>
      <body className="font-pretendard">
        <ScrollbarDetector />
        {children}
        <Toaster />
      </body>
    </html>
  );
}