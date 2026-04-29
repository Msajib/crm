'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ShieldAlert, Home } from 'lucide-react';
import Link from 'next/link';

interface ModuleGuardProps {
  moduleId: string;
  children: React.ReactNode;
}

export default function ModuleGuard({ moduleId, children }: ModuleGuardProps) {
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkModule = () => {
      const saved = localStorage.getItem('global_disabled_modules');
      if (saved) {
        const disabledIds = JSON.parse(saved);
        if (disabledIds.includes(moduleId)) {
          setIsAllowed(false);
          toast.error(`The ${moduleId.toUpperCase()} module has been disabled by the system administrator.`, {
            id: 'module-disabled-alert',
            duration: 5000,
          });
        } else {
          setIsAllowed(true);
        }
      } else {
        setIsAllowed(true);
      }
    };

    checkModule();
    
    // Listen for storage changes in case it's disabled in another tab
    window.addEventListener('storage', checkModule);
    return () => window.removeEventListener('storage', checkModule);
  }, [moduleId, router]);

  if (isAllowed === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAllowed === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md w-full bg-card p-10 rounded-[40px] border border-border shadow-2xl text-center space-y-8 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-destructive/10 rounded-3xl flex items-center justify-center mx-auto text-destructive border border-destructive/20">
            <ShieldAlert className="w-10 h-10" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-foreground">Access Restricted</h1>
            <p className="text-muted-foreground text-sm font-medium">
              This feature has been globally deactivated by the Super Administrator. 
              Please contact support if you believe this is an error.
            </p>
          </div>

          <Link 
            href="/dashboard"
            className="flex items-center justify-center space-x-3 w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
