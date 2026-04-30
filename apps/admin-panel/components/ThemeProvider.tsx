'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { usePathname } from 'next/navigation';

export function ThemeProvider({ children, ...props }: any) {
  const pathname = usePathname();
  const isLanding = pathname === '/';
  
  return (
    <NextThemesProvider 
      {...props} 
      storageKey={isLanding ? 'landing-theme' : 'dashboard-theme'}
    >
      {children}
    </NextThemesProvider>
  );
}
