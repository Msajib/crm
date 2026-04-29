'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import UserNav from './UserNav';
import NotificationCenter from './NotificationCenter';
import GlobalSearch from './GlobalSearch';
import MobileNav from './MobileNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const mustChangePassword = localStorage.getItem('mustChangePassword');
    if (mustChangePassword === 'true' && pathname !== '/dashboard/settings/profile') {
      router.push('/dashboard/settings/profile');
    }
  }, [pathname, router]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:flex h-screen sticky top-0 shrink-0">
        <Sidebar />
      </aside>

      <main className="flex-1 overflow-y-auto pb-24 lg:pb-0">
        {/* Top Navbar */}
        <header className="h-20 border-b border-border flex items-center justify-between px-6 lg:px-10 sticky top-0 bg-background/80 backdrop-blur-xl z-[100]">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <span className="text-micro hidden md:inline">Pages</span>
            <span className="text-muted-foreground/30 text-xs hidden md:inline">/</span>
            <span className="text-micro text-foreground">Dashboard</span>
          </div>
          <div className="flex items-center space-x-4 md:space-x-6">
            <GlobalSearch />
            <NotificationCenter />
            <UserNav />
          </div>
        </header>

        <div className="p-6 lg:p-10">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
