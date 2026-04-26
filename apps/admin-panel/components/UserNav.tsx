'use client';

import React from 'react';
import Link from 'next/link';
import { 
  User, 
  Settings, 
  LogOut, 
  Shield, 
  CreditCard 
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export default function UserNav() {
  return (
    <div className="flex items-center space-x-4">
      <ThemeToggle />
      
      <div className="relative group">
        <button className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-white/10 p-0.5 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
          <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-xs font-bold text-foreground group-hover:bg-primary/10 transition-all">
            JD
          </div>
        </button>

        {/* Dropdown Menu */}
        <div className="absolute right-0 mt-3 w-64 bg-popover rounded-2xl border border-border p-2 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
          <div className="px-4 py-3 border-b border-border mb-2">
            <p className="text-sm font-bold text-foreground">John Doe</p>
            <p className="text-[10px] text-muted-foreground">admin@crm.local</p>
          </div>
          
          <Link href="/dashboard/settings/profile" className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all group">
            <User className="w-4 h-4 group-hover:text-primary" />
            <span className="text-xs font-medium">My Profile</span>
          </Link>
          
          <Link href="/dashboard/settings/branding" className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all group">
            <Settings className="w-4 h-4 group-hover:text-primary" />
            <span className="text-xs font-medium">Account Settings</span>
          </Link>

          <div className="mt-2 pt-2 border-t border-white/5">
            <button 
              onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all group"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
