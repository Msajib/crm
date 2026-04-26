'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  CheckSquare, 
  Settings, 
  Globe, 
  Palette,
  ShieldCheck,
  LogOut,
  Phone,
  Mail,
  MessageSquare,
  Share2,
  TrendingUp,
  CreditCard,
  Building2,
  Key,
  Sparkles,
  Cpu,
  Zap,
  Webhook,
  LayoutGrid
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = React.useState('ADMIN');
  const [globalDisabled, setGlobalDisabled] = React.useState<string[]>([]);
  const [tenantDisabled, setTenantDisabled] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('role');
      if (storedRole) setRole(storedRole);
      const gDisabled = localStorage.getItem('global_disabled_modules');
      if (gDisabled) setGlobalDisabled(JSON.parse(gDisabled));
      const tDisabled = localStorage.getItem('tenant_disabled_modules');
      if (tDisabled) setTenantDisabled(JSON.parse(tDisabled));
    }
  }, []);

  const isModuleDisabled = (moduleId: string) => {
    return globalDisabled.includes(moduleId) || tenantDisabled.includes(moduleId);
  };

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Sales Agent', href: '/dashboard/ai', icon: Sparkles },
    { name: 'Contacts', href: '/contacts', icon: Users },
    ...(!isModuleDisabled('deals') ? [{ name: 'Deals', href: '/deals', icon: Briefcase }] : []),
    ...(!isModuleDisabled('tasks') ? [{ name: 'Tasks', href: '/tasks', icon: CheckSquare }] : []),
  ];

  const commItems = [
    { name: 'Calls', href: '/dashboard/communication/calls', icon: Phone },
    { name: 'Emails', href: '/dashboard/communication/emails', icon: Mail },
    { name: 'Messages', href: '/dashboard/communication/messages', icon: MessageSquare },
  ];

  const marketingItems = [
    { name: 'Social Connect', href: '/dashboard/marketing/social', icon: Share2 },
    { name: 'Analytics', href: '/dashboard/marketing/stats', icon: TrendingUp },
  ];

  const settingItems = [
    { name: 'Branding', href: '/dashboard/settings/branding', icon: Palette },
    { name: 'Custom Domain', href: '/dashboard/settings/domain', icon: Globe },
    { name: 'Payments', href: '/dashboard/settings/payments', icon: CreditCard },
    { name: 'Integrations', href: '/dashboard/settings/integrations', icon: Key },
    { name: 'Workspace Modules', href: '/dashboard/settings/modules', icon: LayoutGrid },
  ];

  const superAdminItems = [
    { name: 'Tenants', href: '/dashboard/super-admin/tenants', icon: Building2 },
    { name: 'Automations', href: '/dashboard/administration/automations', icon: Zap },
    { name: 'MCP Server', href: '/dashboard/administration/mcp', icon: Cpu },
    { name: 'Webhooks', href: '/dashboard/administration/webhooks', icon: Webhook },
    { name: 'Global Modules', href: '/dashboard/super-admin/modules', icon: Globe },
    { name: 'System Setup', href: '/dashboard/super-admin/setup', icon: ShieldCheck },
    { name: 'System Settings', href: '/dashboard/super-admin/settings', icon: Settings },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <div className="w-72 bg-background border-r border-border flex flex-col h-screen sticky top-0 shrink-0">
      {/* Brand */}
      <div className="p-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-black text-xl">C</span>
          </div>
          <div>
            <h1 className="text-foreground font-bold text-lg leading-tight">CRM Pro</h1>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Enterprise</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 px-4 py-4 space-y-8 overflow-y-auto custom-scrollbar">
        <div>
          <p className="px-4 text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-4">Core CRM</p>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <SidebarLink key={item.name} item={item} active={isActive(item.href)} />
            ))}
          </nav>
        </div>

        {!isModuleDisabled('communication') && (
          <div>
            <p className="px-4 text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-4">Communication</p>
            <nav className="space-y-1">
              {commItems.map((item) => (
                <SidebarLink key={item.name} item={item} active={isActive(item.href)} />
              ))}
            </nav>
          </div>
        )}

        {!isModuleDisabled('marketing') && (
          <div>
            <p className="px-4 text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-4">Marketing</p>
            <nav className="space-y-1">
              {marketingItems.map((item) => (
                <SidebarLink key={item.name} item={item} active={isActive(item.href)} />
              ))}
            </nav>
          </div>
        )}

        <div>
          <p className="px-4 text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-4">Workspace</p>
          <nav className="space-y-1">
            {settingItems.map((item) => (
              <SidebarLink key={item.name} item={item} active={isActive(item.href)} />
            ))}
          </nav>
        </div>

        {role === 'SUPER_ADMIN' && (
          <div>
            <p className="px-4 text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-4">Administration</p>
            <nav className="space-y-1">
              {superAdminItems.map((item) => (
                <SidebarLink key={item.name} item={item} active={isActive(item.href)} isWarning />
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Footer */}

      {/* Footer */}
      <div className="p-4 mt-auto">
        <button 
          onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
          className="w-full flex items-center space-x-3 px-4 py-4 rounded-2xl bg-muted text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="font-bold text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

function SidebarLink({ item, active, isWarning }: { item: any, active: boolean, isWarning?: boolean }) {
  const Icon = item.icon;
  return (
    <Link 
      href={item.href}
      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all group ${
        active 
          ? (isWarning ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary')
          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
      }`}
    >
      <Icon className={`w-5 h-5 ${active ? (isWarning ? 'text-amber-500' : 'text-primary') : 'text-muted-foreground group-hover:text-foreground'}`} />
      <span className="font-medium text-sm">{item.name}</span>
      {active && !isWarning && <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full shadow-lg shadow-primary/50"></div>}
      {active && isWarning && <div className="ml-auto w-1.5 h-1.5 bg-amber-500 rounded-full shadow-lg shadow-amber-500/50"></div>}
    </Link>
  );
}
