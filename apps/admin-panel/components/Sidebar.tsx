'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
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
  Target,
  Cpu,
  Zap,
  Webhook,
  Trash2,
  LayoutGrid,
  History,
  Bot,
  FileText
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { role: authRole, logout } = useAuth();
  const [role, setRole] = React.useState('ADMIN');
  const [globalDisabled, setGlobalDisabled] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('role');
      if (storedRole) setRole(storedRole);
      const gDisabled = localStorage.getItem('global_disabled_modules');
      if (gDisabled) setGlobalDisabled(JSON.parse(gDisabled));
    }
  }, []);

  // Sync role from useAuth when it becomes available
  React.useEffect(() => {
    if (authRole) setRole(authRole);
  }, [authRole]);

  const isModuleDisabled = (moduleId: string) => {
    return globalDisabled.includes(moduleId);
  };

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ...(!isModuleDisabled('ai') ? [{ name: 'AI Sales Agent', href: '/dashboard/ai', icon: Sparkles }] : []),
    { name: 'Leads', href: '/dashboard/leads', icon: Target },
    ...(!isModuleDisabled('contacts') ? [{ name: 'Contacts', href: '/contacts', icon: Users }] : []),
    ...(!isModuleDisabled('deals') ? [{ name: 'Deals', href: '/deals', icon: Briefcase }] : []),
    ...(!isModuleDisabled('tasks') ? [{ name: 'Tasks', href: '/tasks', icon: CheckSquare }] : []),
  ];

  const commItems = [
    { name: 'Calls', href: '/dashboard/communication/calls', icon: Phone },
    { name: 'Emails', href: '/dashboard/communication/emails', icon: Mail },
    { name: 'Email Templates', href: '/dashboard/communication/templates', icon: FileText },
    { name: 'Messages', href: '/dashboard/communication/messages', icon: MessageSquare },
  ];

  const automationItems = [
    { name: 'Campaigns', href: '/dashboard/automation/campaigns', icon: Zap },
  ];

  const marketingItems = [
    { name: 'Social Connect', href: '/dashboard/marketing/social', icon: Share2 },
    { name: 'Intelligence', href: '/dashboard/marketing/stats', icon: TrendingUp },
  ];

  const workspaceItems = [
    { name: 'Profile Settings', href: '/dashboard/settings/profile', icon: Settings },
    ...(role !== 'SUPER_ADMIN' ? [{ name: 'Team Members', href: '/dashboard/settings/users', icon: Users }] : []),
    { name: 'Subscription', href: '/dashboard/settings/subscription', icon: CreditCard },
  ];

  const systemSettingsItems = [
    ...(role === 'SUPER_ADMIN' ? [{ name: 'System Setup', href: '/dashboard/super-admin/setup', icon: ShieldCheck }] : []),
    { name: 'Dashboard Stats', href: '/dashboard/settings/dashboard', icon: LayoutGrid },
    { name: 'Branding', href: '/dashboard/settings/branding', icon: Palette },
    { name: 'Custom Domain', href: '/dashboard/settings/domain', icon: Globe },
    ...(!isModuleDisabled('payments') ? [{ name: 'Payments', href: '/dashboard/settings/payments', icon: CreditCard }] : []),
    { name: 'AI Engine Config', href: '/dashboard/super-admin/ai-settings', icon: Cpu },
    { name: 'Integrations', href: '/dashboard/settings/integrations', icon: Key },
    { name: 'Email SMTP', href: '/dashboard/settings/email', icon: Mail },
  ];

  const superAdminItems = [
    { name: 'Tenants', href: '/dashboard/super-admin/tenants', icon: Building2 },
    { name: 'Payment History', href: '/dashboard/super-admin/payments', icon: History },
    ...(!isModuleDisabled('automations') ? [{ name: 'Automations', href: '/dashboard/administration/automations', icon: Zap }] : []),
    ...(!isModuleDisabled('mcp') ? [{ name: 'MCP Server', href: '/dashboard/administration/mcp', icon: Cpu }] : []),
    ...(!isModuleDisabled('webhooks') ? [{ name: 'Webhooks', href: '/dashboard/administration/webhooks', icon: Webhook }] : []),
    { name: 'Global Modules', href: '/dashboard/super-admin/modules', icon: Globe },
    { name: 'AI Infrastructure', href: '/dashboard/super-admin/ai-settings', icon: Bot },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <div className="w-72 bg-background border-r border-border flex flex-col h-screen sticky top-0 shrink-0 z-[110]">
      {/* Brand */}
      <div className="p-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-subheading text-foreground leading-tight">CRM Pro</h1>
            <span className="text-micro text-muted-foreground">Enterprise</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 px-4 py-4 space-y-8 overflow-y-auto scrollbar-hide">
        <div>
          <p className="px-4 text-micro text-muted-foreground/60 mb-4 uppercase tracking-[0.1em]">Core CRM</p>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <SidebarLink key={item.name} item={item} active={isActive(item.href)} />
            ))}
          </nav>
        </div>

        {!isModuleDisabled('communication') && (
          <div>
            <p className="px-4 text-micro text-muted-foreground/60 mb-4 uppercase tracking-[0.1em]">Communication</p>
            <nav className="space-y-1">
              {commItems.map((item) => (
                <SidebarLink key={item.name} item={item} active={isActive(item.href)} />
              ))}
            </nav>
          </div>
        )}

        {!isModuleDisabled('automations') && (
          <div>
            <p className="px-4 text-micro text-muted-foreground/60 mb-4 uppercase tracking-[0.1em]">Automation</p>
            <nav className="space-y-1">
              {automationItems.map((item) => (
                <SidebarLink key={item.name} item={item} active={isActive(item.href)} />
              ))}
            </nav>
          </div>
        )}

        {!isModuleDisabled('marketing') && (
          <div>
            <p className="px-4 text-micro text-muted-foreground/60 mb-4 uppercase tracking-[0.1em]">Intelligence</p>
            <nav className="space-y-1">
              {marketingItems.map((item) => (
                <SidebarLink key={item.name} item={item} active={isActive(item.href)} />
              ))}
            </nav>
          </div>
        )}

        <div>
          <p className="px-4 text-micro text-muted-foreground/60 mb-4 uppercase tracking-[0.1em]">Workspace</p>
          <nav className="space-y-1">
            {workspaceItems.map((item) => (
              <SidebarLink key={item.name} item={item} active={isActive(item.href)} />
            ))}
          </nav>
        </div>

        <div>
          <p className="px-4 text-micro text-muted-foreground/60 mb-4 uppercase tracking-[0.1em]">System Settings</p>
          <nav className="space-y-1">
            {systemSettingsItems.map((item) => (
              <SidebarLink key={item.name} item={item} active={isActive(item.href)} />
            ))}
          </nav>
        </div>

        {role === 'SUPER_ADMIN' && (
          <div>
            <p className="px-4 text-micro text-muted-foreground/60 mb-4 uppercase tracking-[0.1em]">Administration</p>
            <nav className="space-y-1">
              {superAdminItems.map((item) => (
                <SidebarLink key={item.name} item={item} active={isActive(item.href)} isWarning />
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 mt-auto">
        <button 
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-4 rounded-2xl bg-muted text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="text-body font-bold">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

function SidebarLink({ item, active, isWarning }: { item: any, active: boolean, isWarning?: boolean }) {
  const Icon = item.icon;
  const linkRef = React.useRef<HTMLAnchorElement>(null);

  React.useEffect(() => {
    if (active && linkRef.current) {
      linkRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [active]);

  return (
    <Link 
      ref={linkRef}
      href={item.href}
      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all group ${
        active 
          ? (isWarning ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-primary/10 text-primary')
          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
      }`}
    >
      <Icon className={`w-5 h-5 ${active ? (isWarning ? 'text-amber-600 dark:text-amber-400' : 'text-primary') : 'text-muted-foreground group-hover:text-foreground'}`} />
      <span className="text-body font-semibold">{item.name}</span>
      {active && !isWarning && <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full shadow-lg shadow-primary/50"></div>}
      {active && isWarning && <div className="ml-auto w-1.5 h-1.5 bg-amber-500 rounded-full shadow-lg shadow-amber-500/50"></div>}
    </Link>
  );
}
