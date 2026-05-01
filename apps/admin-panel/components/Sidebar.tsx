'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
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
  FileText,
  GitBranch
} from 'lucide-react';

import { useBranding } from '@/components/BrandingProvider';
import { api } from '@/lib/api';

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { role: authRole, logout } = useAuth();
  const { logoUrl, workspaceName } = useBranding();
  const [role, setRole] = React.useState('ADMIN');
  const [permissions, setPermissions] = React.useState<string[]>([]);
  const [globalDisabled, setGlobalDisabled] = React.useState<string[]>([]);
  const [planTier, setPlanTier] = React.useState<string>('STARTER');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('role');
      if (storedRole) setRole(storedRole);

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setPermissions(user.permissions || []);
        } catch (e) {}
      }

      const gDisabled = localStorage.getItem('global_disabled_modules');
      if (gDisabled) setGlobalDisabled(JSON.parse(gDisabled));

      // Fetch tenant plan
      const fetchPlan = async () => {
        try {
          const data = await api.get('/tenants/current');
          if (data && data.plan) setPlanTier(data.plan.tier || 'STARTER');
        } catch (e) {}
      };
      fetchPlan();
    }
  }, []);

  // Sync role from useAuth when it becomes available
  React.useEffect(() => {
    if (authRole) setRole(authRole);
  }, [authRole]);

  const isModuleDisabled = (moduleId: string) => {
    return globalDisabled.includes(moduleId);
  };

  const hasPermission = (moduleKey?: string) => {
    if (!moduleKey) return true;
    const currentRole = role?.toUpperCase();
    
    // Super Admins have full access to everything
    if (currentRole === 'SUPER_ADMIN') return true;

    // Admins have access to all CRM/Staff modules by default
    if (currentRole === 'ADMIN') return true;

    // STAFF are restricted by their assigned permissions array
    return permissions.includes(moduleKey);
  };

  // Derive whether sections have any visible items (for STAFF)
  const isStaff = role?.toUpperCase() === 'STAFF';
  const isSuperAdmin = role?.toUpperCase() === 'SUPER_ADMIN';

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: 'dashboard:view' },
    ...(!isModuleDisabled('ai') && hasPermission('ai:view') ? [{ name: 'AI Sales Agent', href: '/dashboard/ai', icon: Sparkles }] : []),
    ...(!isModuleDisabled('contacts') && (hasPermission('contacts:read') || hasPermission('leads:read')) ? [{ name: 'Contacts & Leads', href: '/contacts', icon: Users }] : []),
    ...(!isModuleDisabled('deals') && hasPermission('deals:read') ? [{ name: 'Deals', href: '/deals', icon: Briefcase }] : []),
    ...(!isModuleDisabled('tasks') && hasPermission('tasks:read') ? [{ name: 'Tasks', href: '/tasks', icon: CheckSquare }] : []),
  ].filter(i => !i.permission || hasPermission(i.permission));

  const commItems = [
    ...(hasPermission('communications:view') ? [
      { name: 'Calls', href: '/dashboard/communication/calls', icon: Phone },
      { name: 'Emails', href: '/dashboard/communication/emails', icon: Mail },
      { name: 'Email Templates', href: '/dashboard/communication/templates', icon: FileText },
      { name: 'Messages', href: '/dashboard/communication/messages', icon: MessageSquare },
    ] : []),
  ];

  const automationItems = [
    ...(!isModuleDisabled('automations') && hasPermission('marketing:view') ? [
      { name: 'Campaigns', href: '/dashboard/automation/campaigns', icon: Zap },
    ] : []),
  ];

  const marketingItems = [
    ...(hasPermission('marketing:view') ? [
      { name: 'Social Connect', href: '/dashboard/marketing/social', icon: Share2 },
      { name: 'Intelligence', href: '/dashboard/marketing/stats', icon: TrendingUp },
    ] : []),
  ];

  const systemSettingsItems = [
    // Consolidated System Settings for non-super admins
    ...(!isSuperAdmin ? [
      { name: 'System Settings', href: '/dashboard/super-admin/settings?tab=branding', icon: Settings },
      { name: 'Integration Hub', href: '/dashboard/settings/integrations', icon: Webhook },
      { name: 'Pipelines', href: '/dashboard/settings/pipelines', icon: GitBranch },
    ] : []),
    
    // Super admin only specific setup
    ...(isSuperAdmin ? [{ name: 'Deployment Wizard', href: '/dashboard/super-admin/setup', icon: ShieldCheck }] : []),
    
    
    // AI Engine — super admin or permission
    ...(isSuperAdmin || (!isStaff || hasPermission('ai:view'))
      ? [{ name: 'AI Engine Config', href: '/dashboard/super-admin/ai-settings', icon: Cpu }]
      : []),
    ...(!isSuperAdmin ? [
      { name: 'Team Members', href: '/dashboard/settings/users', icon: Users },
    ] : []),
  ];

  const superAdminItems = [
    { name: 'Tenants', href: '/dashboard/super-admin/tenants', icon: Building2 },
    { name: 'System Settings', href: '/dashboard/super-admin/settings?tab=branding', icon: Settings },
    { name: 'Integration Hub', href: '/dashboard/settings/integrations', icon: Webhook },
    ...(!isModuleDisabled('webhooks') ? [{ name: 'Webhooks', href: '/dashboard/administration/webhooks', icon: Webhook }] : []),
    { name: 'Payment History', href: '/dashboard/super-admin/payments', icon: History },
    { name: 'AI Infrastructure', href: '/dashboard/super-admin/ai-settings', icon: Bot },
    ...(!isModuleDisabled('automations') ? [{ name: 'Automations Control', href: '/dashboard/administration/automations', icon: Zap }] : []),
  ];

  const isActive = (path: string) => {
    if (!path.includes('?')) return pathname === path;
    // For paths with query params, we need to match the specific tab
    const url = new URL(path, 'http://localhost');
    const tab = url.searchParams.get('tab');
    return pathname === url.pathname && searchParams.get('tab') === tab;
  };

  return (
    <div className="w-72 bg-background border-r border-border flex flex-col h-screen sticky top-0 shrink-0 z-[110]">
      {/* Brand */}
      <div className="p-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shadow-lg border border-primary/20 overflow-hidden">
            {logoUrl ? (
               <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
            ) : (
               <Building2 className="w-6 h-6 text-primary" />
            )}
          </div>
          <div>
            <h1 className="text-subheading text-foreground leading-tight truncate max-w-[120px]">{workspaceName}</h1>
            <span className="text-micro text-muted-foreground">Workspace</span>
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

        {!isModuleDisabled('communication') && commItems.length > 0 && (
          <div>
            <p className="px-4 text-micro text-muted-foreground/60 mb-4 uppercase tracking-[0.1em]">Communication</p>
            <nav className="space-y-1">
              {commItems.map((item) => (
                <SidebarLink key={item.name} item={item} active={isActive(item.href)} />
              ))}
            </nav>
          </div>
        )}

        {automationItems.length > 0 && (
          <div>
            <p className="px-4 text-micro text-muted-foreground/60 mb-4 uppercase tracking-[0.1em]">Automation</p>
            <nav className="space-y-1">
              {automationItems.map((item) => (
                <SidebarLink key={item.name} item={item} active={isActive(item.href)} />
              ))}
            </nav>
          </div>
        )}

        {marketingItems.length > 0 && (
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
          <p className="px-4 text-micro text-muted-foreground/60 mb-4 uppercase tracking-[0.1em]">{isSuperAdmin ? 'System Configuration' : 'Workspace Config'}</p>
          <nav className="space-y-1">
            {systemSettingsItems.map((item) => (
              <SidebarLink key={item.name} item={item} active={isActive(item.href)} />
            ))}
          </nav>
        </div>

        {role?.toUpperCase() === 'SUPER_ADMIN' && (
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
