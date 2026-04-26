'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  CheckSquare, 
  Sparkles,
  Search,
  PlusCircle
} from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  const items = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Contacts', href: '/contacts', icon: Users },
    { name: 'AI', href: '/dashboard/ai', icon: Sparkles },
    { name: 'Deals', href: '/deals', icon: Briefcase },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-xl border-t border-border z-50 flex items-center justify-around px-2">
      {items.map((item) => (
        <Link 
          key={item.name} 
          href={item.href}
          className={`flex flex-col items-center justify-center space-y-1 transition-all ${
            isActive(item.href) ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <div className={`p-2 rounded-xl ${isActive(item.href) ? 'bg-primary/10' : ''}`}>
             <item.icon className={`w-5 h-5 ${isActive(item.href) ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest">{item.name}</span>
          {isActive(item.href) && <div className="w-1 h-1 bg-primary rounded-full mt-0.5"></div>}
        </Link>
      ))}
    </div>
  );
}
