import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CRM Pro - SaaS Platform',
  description: 'Enterprise Grade CRM Platform',
  icons: {
    icon: '/favicon.png',
  },
};

import { ThemeProvider } from '@/components/ThemeProvider';
import { BrandingProvider } from '@/components/BrandingProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <BrandingProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster position="top-right" toastOptions={{ className: 'z-[99999]' }} containerStyle={{ zIndex: 99999 }} />
          </ThemeProvider>
        </BrandingProvider>
      </body>
    </html>
  );
}
