import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

// Google Fontsの設定
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// タイトル名や説明文
export const metadata: Metadata = {
  title: 'Workout Memo App',
  description:
    'Keep track of your progress in your training sessions with this app.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      {/* antialiased: 文字を滑らかにするTailWindCSSのクラス */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Page.tsxの場所 */}
        {children}
      </body>
    </html>
  );
}
