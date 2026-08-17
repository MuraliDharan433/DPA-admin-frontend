import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] });
const sora = Sora({ variable: '--font-sora', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Institute Admin | Training & Placement Management',
  description: 'Admin dashboard for IT training and placement institutes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
