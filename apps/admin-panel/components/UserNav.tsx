'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, 
  Settings, 
  LogOut, 
  Loader2,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/hooks/useAuth';

export default function UserNav() {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState<{ firstName?: string, lastName?: string, email?: string, avatar?: string } | null>(null);
  const [role, setRole] = useState('ADMIN');
  const [isImpersonating, setIsImpersonating] = useState(false);

  useEffect(() => {
    const loadUser = () => {
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('user');
          if (stored) {
            setUser(JSON.parse(stored));
          }
          const storedRole = localStorage.getItem('role');
          if (storedRole) {
            setRole(storedRole);
          }
          setIsImpersonating(localStorage.getItem('isImpersonating') === 'true');
        } catch (e) {
          console.error('Failed to parse user from localStorage');
        }
      }
    };

    loadUser();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('profile-updated', loadUser);
      window.addEventListener('storage', (e) => {
        if (e.key === 'user') loadUser();
      });
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('profile-updated', loadUser);
        window.removeEventListener('storage', loadUser);
      }
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout(); // logout handles navigation — no need to reset state
  };

  const handleSwitchBack = () => {
    const originalUser = localStorage.getItem('original_user');
    const originalRole = localStorage.getItem('original_role');
    const originalTenantSlug = localStorage.getItem('original_tenant_slug');

    if (originalUser && originalRole) {
      localStorage.setItem('user', originalUser);
      localStorage.setItem('role', originalRole);
      localStorage.setItem('tenant_slug', originalTenantSlug || 'system');
      localStorage.removeItem('isImpersonating');
      localStorage.removeItem('original_user');
      localStorage.removeItem('original_role');
      localStorage.removeItem('original_tenant_slug');
      localStorage.removeItem('tenant_id'); // Clear impersonated tenant id
      
      window.location.href = '/dashboard';
    }
  };

  const getInitials = () => {
    if (!user) return 'JD';
    return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
  };

  return (
    <div className="flex items-center space-x-4">
      <ThemeToggle />
      
      <div className="relative group">
        <button className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-white/10 p-0.5 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
          {user?.avatar ? (
            <img src={user.avatar} alt="User Avatar" className="w-full h-full rounded-full object-cover" />
          ) : (
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-xs font-bold text-foreground group-hover:bg-primary/10 transition-all">
              {getInitials()}
            </div>
          )}
        </button>

        {/* Dropdown Menu */}
        <div className="absolute right-0 mt-3 w-64 bg-popover rounded-2xl border border-border p-2 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
          <div className="px-4 py-3 border-b border-border mb-2 relative">
          <p className="text-body font-bold text-foreground">{user ? `${user.firstName} ${user.lastName}` : 'John Doe'}</p>
          <p className="text-caption text-muted-foreground">{user?.email || 'admin@crm.local'}</p>
          <span className="absolute top-3 right-4 px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[8px] font-black uppercase">
             {(user as any)?.customRole?.name || role}
          </span>
          </div>

          {isImpersonating && (
            <button 
              onClick={handleSwitchBack}
              className="w-[calc(100%-16px)] mx-2 mb-2 flex items-center justify-center space-x-2 px-3 py-2.5 bg-amber-500/10 text-amber-500 rounded-xl hover:bg-amber-500 hover:text-white transition-all group font-black text-[10px] uppercase tracking-widest border border-amber-500/20"
            >
              <LogOut className="w-3.5 h-3.5 rotate-180" />
              <span>Switch Back to Admin</span>
            </button>
          )}
          
          <Link href="/dashboard/super-admin/settings?tab=profile" className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all group">
            <User className="w-4 h-4 group-hover:text-primary transition-colors" />
            <span className="text-body font-semibold">My Profile</span>
          </Link>
          
          <Link href="/dashboard/super-admin/settings?tab=branding" className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all group">
            <Settings className="w-4 h-4 group-hover:text-primary transition-colors" />
            <span className="text-body font-semibold">System Settings</span>
          </Link>

          <div className="mt-2 pt-2 border-t border-border">
            <button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all group disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              <span className="text-body font-semibold">
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
