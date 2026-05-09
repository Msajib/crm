'use client';

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/components/DashboardLayout';
import RichTextEditor from '@/components/RichTextEditor';
import {
  Save, Palette, Globe, CreditCard, Plus, Trash2, Check, ShieldCheck, GitBranch, LayoutGrid, Zap, Info, ChevronRight, Target, GripVertical, Smartphone, MessageSquare, Sparkles, BarChart3, Webhook, Cpu, Users, History, Building2, X, Edit3, Mail, User, Camera, AlertTriangle, Shield, Phone, ExternalLink, QrCode, Server, Eye, EyeOff, RefreshCw, Settings2, Send, Lock, Link as LinkIcon, Edit2, Layout, Database
} from 'lucide-react';
import { PasswordField } from '@/components/ui/PasswordField';
import PremiumModal from '@/components/PremiumModal';
import { api } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  badge: string;
  description: string;
  features: string[];
  highlighted: boolean;
  cta: string;
}

const DEFAULT_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$49',
    period: '/month',
    badge: '',
    description: '<p>Perfect for small teams getting started with CRM.</p>',
    features: ['10 Users', 'Basic AI Scoring', 'Email Integration', 'Standard Analytics'],
    highlighted: false,
    cta: 'Get Started',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$149',
    period: '/month',
    badge: 'Most Popular',
    description: '<p>The full power of AI-driven sales automation for growing teams.</p>',
    features: ['Unlimited Users', 'Autonomous AI Agent', 'Full Automation Wizard', 'Advanced Analytics', 'Webhook System'],
    highlighted: true,
    cta: 'Start Free Trial',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    badge: '',
    description: '<p>Tailored for large organizations with complex requirements and dedicated support.</p>',
    features: ['Multi-tenant Deployment', 'MCP Protocol Server', 'White-label Options', '24/7 Priority Support', 'Custom Integrations'],
    highlighted: false,
    cta: 'Contact Sales',
  },
];

const ALL_MODULES = [
  { id: 'contacts', name: 'Contacts & CRM', desc: 'Core contact management, segmentation and lifecycle tracking.', icon: Users, color: 'text-blue-500 bg-blue-500/10' },
  { id: 'deals', name: 'Deals & Pipeline', desc: 'Sales pipeline management and revenue forecasting.', icon: Target, color: 'text-emerald-500 bg-emerald-500/10' },
  { id: 'tasks', name: 'Tasks & Projects', desc: 'Task management, Kanban boards, and team collaboration.', icon: LayoutGrid, color: 'text-indigo-500 bg-indigo-500/10' },
  { id: 'marketing', name: 'Marketing Hub', desc: 'Social account connections and automated campaigns.', icon: Zap, color: 'text-amber-500 bg-amber-500/10' },
  { id: 'communication', name: 'Communication', desc: 'Centralized business calls, emails, and SMS.', icon: MessageSquare, color: 'text-rose-500 bg-rose-500/10' },
  { id: 'ai', name: 'AI Sales Agent', desc: 'Predictive lead scoring and automated AI assistance.', icon: Sparkles, color: 'text-purple-500 bg-purple-500/10' },
  { id: 'analytics', name: 'Advanced Analytics', desc: 'Deep insights and custom reporting dashboards.', icon: BarChart3, color: 'text-cyan-500 bg-cyan-500/10' },
  { id: 'payments', name: 'Payment Gateways', desc: 'Stripe, PayPal and regional gateway integrations.', icon: CreditCard, color: 'text-slate-500 bg-slate-500/10' },
  { id: 'automations', name: 'Workflow Automations', desc: 'Advanced rule-based triggers and cross-module actions.', icon: Zap, color: 'text-yellow-500 bg-yellow-500/10' },
  { id: 'webhooks', name: 'API Webhooks', desc: 'Real-time event notifications for external integrations.', icon: Webhook, color: 'text-orange-500 bg-orange-500/10' },
  { id: 'mcp', name: 'MCP Integration', desc: 'Model Context Protocol server for advanced AI connectivity.', icon: Cpu, color: 'text-violet-500 bg-violet-500/10' },
];

const STAT_OPTIONS = [
  { id: 'Revenue', label: 'Won Revenue', desc: 'Total value of successfully closed deals.', group: 'Sales' },
  { id: 'Deals', label: 'Active Deals', desc: 'Open opportunities currently in the pipeline.', group: 'Sales' },
  { id: 'ConversionRate', label: 'Conversion Rate', desc: 'Percentage of deals successfully won vs. total.', group: 'Sales' },
  { id: 'Contacts', label: 'Total Contacts', desc: 'Size of your customer and lead database.', group: 'CRM' },
  { id: 'Tasks', label: 'Open Tasks', desc: 'Pending tasks that require attention.', group: 'Productivity' },
  { id: 'TasksCompleted', label: 'Completed Tasks', desc: 'Tasks your team has finished.', group: 'Productivity' },
  { id: 'OverdueTasks', label: 'Overdue Tasks', desc: 'Tasks that passed their due date without completion.', group: 'Productivity' },
  { id: 'Calls', label: 'Calls Logged', desc: 'Total phone calls recorded as activities.', group: 'Communication' },
  { id: 'Emails', label: 'Emails Sent', desc: 'Total emails recorded as activities.', group: 'Communication' },
  { id: 'Messages', label: 'Messages Sent', desc: 'SMS & WhatsApp messages recorded as activities.', group: 'Communication' },
  { id: 'RevenueChart', label: 'Revenue Analytics Chart', desc: 'Show the full revenue trend chart panel on the dashboard.', group: 'Panels' },
  { id: 'AIInsights', label: 'AI Lead Insights', desc: 'Show the AI-powered lead score sidebar panel.', group: 'Panels' },
  { id: 'Campaigns', label: 'Campaign Monitoring', desc: 'Show real-time progress bars for active marketing campaigns.', group: 'Panels' },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SuperAdminSettings() {
  return (
    <DashboardLayout>
      <React.Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>}>
        <SettingsContent />
      </React.Suspense>
    </DashboardLayout>
  );
}

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role } = useAuth();
  const tabParam = searchParams.get('tab');
  
  const isSuperAdmin = role?.toUpperCase() === 'SUPER_ADMIN';
  const isAdmin = role?.toUpperCase() === 'ADMIN';

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'branding' | 'pricing' | 'sso' | 'templates' | 'pipelines' | 'modules' | 'stats' | 'subscription' | 'domain' | 'infrastructure'>((tabParam as any) || 'branding');

  // SSO Options State
  const [ssoProviders, setSsoProviders] = useState({
    google: true,
    github: true,
    linkedin: false,
    microsoft: false
  });

  // Domain State
  const [domainSettings, setDomainSettings] = useState({
    subdomain: '',
    customDomain: '',
    domainStatus: 'PENDING',
    domainVerified: false,
  });
  
  // Settings State
  const [settings, setSettings] = useState({
    systemName: 'CRM Pro',
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#6366f1',
    secondaryColor: '#4f46e5',
    accentColor: '#f59e0b',
    metaDescription: 'The ultimate CRM for your business',
    expiryWarningTemplate: '',
    expiryFinalTemplate: '',
    redisUri: 'redis://localhost:6379',
    brokerType: 'redis',
    mcpServerUrl: 'http://localhost:3012',
  });

  // User Profile State
  const [profile, setProfile] = useState({
    firstName: '', lastName: '', email: '', role: '', avatar: '', phone: '', password: '',
  });
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Workspace Branding State (for Admins)
  const [workspaceBranding, setWorkspaceBranding] = useState({
    name: '', logoUrl: '', faviconUrl: '', primaryColor: '#6366f1', secondaryColor: '#4f46e5', accentColor: '#f59e0b',
  });
  const [tenant, setTenant] = useState<any>(null);

  // Plans State
  const [plans, setPlans] = useState<PricingPlan[]>(DEFAULT_PLANS);
  
  // Templates State
  const [customTemplates, setCustomTemplates] = useState<any[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [newTemplate, setNewTemplate] = useState({ name: '', subject: '', content: '', category: 'GENERAL' });

  // Pipelines State
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [showPipelineModal, setShowPipelineModal] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState<any>(null);
  const [newPipeline, setNewPipeline] = useState({
    name: '',
    stages: [
      { name: 'Qualification', color: '#6366f1', probability: 20, order: 1 },
      { name: 'Meeting', color: '#f59e0b', probability: 40, order: 2 },
      { name: 'Proposal', color: '#3b82f6', probability: 60, order: 3 },
      { name: 'Closing', color: '#8b5cf6', probability: 80, order: 4 },
    ]
  });

  // Modules State
  const [enabledModules, setEnabledModules] = useState<string[]>([]);

  // Stats Prefs
  const [preferences, setPreferences] = useState<string[]>([]);

  useEffect(() => {
    if (tabParam) setActiveTab(tabParam as any);
  }, [tabParam]);

  useEffect(() => {
    if (role) {
      setFetching(true);
      const tasks = [fetchProfileData()];
      if (isSuperAdmin) tasks.push(fetchInitialData());
      if (isAdmin) tasks.push(fetchTenantData());
      
      Promise.all(tasks).finally(() => {
        setFetching(false);
      });
    }
  }, [role, isSuperAdmin, isAdmin]);

  const fetchInitialData = async () => {
    try {
      const [settingsData, systemTpl, commTpl, pipelinesData] = await Promise.all([
        api.get('/tenants/system/settings').catch(() => null),
        api.get('/tenants/system/templates').catch(() => []),
        api.get('/communications/templates').catch(() => []),
        api.get('/pipelines').catch(() => [])
      ]);
      
      if (settingsData) {
        setSettings(prev => ({ 
          ...prev, 
          systemName: settingsData.systemName || '',
          logoUrl: settingsData.logoUrl || '',
          faviconUrl: settingsData.faviconUrl || '',
          primaryColor: settingsData.primaryColor || '#6366f1',
          secondaryColor: settingsData.secondaryColor || '#4f46e5',
          accentColor: settingsData.accentColor || '#f59e0b',
          metaDescription: settingsData.metaDescription || '',
          expiryWarningTemplate: settingsData.expiryWarningTemplate || '',
          expiryFinalTemplate: settingsData.expiryFinalTemplate || '',
          redisUri: settingsData.redisUri || 'redis://localhost:6379',
          brokerType: settingsData.brokerType || 'redis',
          mcpServerUrl: settingsData.mcpServerUrl || 'http://localhost:3012',
        }));
      }

      let mergedTemplates: any[] = [];
      const sTemplates = Array.isArray(systemTpl) ? systemTpl : (systemTpl?.data || []);
      const cTemplates = Array.isArray(commTpl) ? commTpl : (commTpl?.data || []);
      
      mergedTemplates = [
        ...sTemplates.map((t: any) => ({ ...t, isSystem: true })),
        ...cTemplates
      ];
      
      setCustomTemplates(mergedTemplates);

      if (pipelinesData) setPipelines(pipelinesData || []);

      // Load LocalStorage items
      const savedPlans = localStorage.getItem('crm_pricing_plans');
      if (savedPlans) setPlans(JSON.parse(savedPlans));

      const savedModules = localStorage.getItem('global_disabled_modules');
      const allModuleIds = ALL_MODULES.map(m => m.id);
      if (savedModules) {
        const disabled = JSON.parse(savedModules);
        setEnabledModules(allModuleIds.filter(id => !disabled.includes(id)));
      } else {
        setEnabledModules(allModuleIds);
      }

      const savedSso = localStorage.getItem('crm_sso_providers');
      if (savedSso) {
        setSsoProviders(JSON.parse(savedSso));
      }

      const savedPrefs = localStorage.getItem('dashboard_stats_prefs');
      if (savedPrefs) setPreferences(JSON.parse(savedPrefs));
      else setPreferences(['Revenue', 'Deals', 'Contacts', 'Tasks', 'RevenueChart', 'AIInsights']);

    } catch (err) {
      console.error('Data fetch failed', err);
    }
  };

  const fetchProfileData = async () => {
    try {
      const data = await api.get('/users/me');
      setProfile({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        role: data.role || '',
        avatar: data.avatar || '',
        phone: data.phone || '',
        password: '',
      });
      setMustChangePassword(localStorage.getItem('mustChangePassword') === 'true');
    } catch (e) {}
  };

  const fetchTenantData = async () => {
    try {
      const data = await api.get('/tenants/current');
      if (data) {
        setTenant(data);
        setWorkspaceBranding({
          name: data.name || '', logoUrl: data.logoUrl || '', faviconUrl: data.faviconUrl || '',
          primaryColor: data.primaryColor || '#6366f1', secondaryColor: data.secondaryColor || '#4f46e5', accentColor: data.accentColor || '#f59e0b',
        });
        setDomainSettings({
          subdomain: data.subdomain || '',
          customDomain: data.customDomain || '',
          domainStatus: data.domainStatus || 'PENDING',
          domainVerified: data.domainVerified || false,
        });
      }
    } catch (e) {}
  };

  // --- Handlers ---
  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/tenants/system/settings', settings);
      window.dispatchEvent(new CustomEvent('branding-updated'));
      toast.success('System settings updated!');
    } catch (err) { toast.error('Save failed'); } finally { setLoading(false); }
  };

  const handleSaveWorkspaceBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch(`/tenants/${tenant.id}/branding`, workspaceBranding);
      window.dispatchEvent(new CustomEvent('branding-updated'));
      toast.success('Workspace identity deployed successfully');
    } catch (err: any) { toast.error('Update failed'); } finally { setLoading(false); }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch('/users/me', {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        avatar: profile.avatar,
      });

      if (mustChangePassword && profile.password) {
        if (profile.password.length < 8) {
          toast.error('Password must be at least 8 characters long');
          setLoading(false);
          return;
        }
        localStorage.removeItem('mustChangePassword');
        setMustChangePassword(false);
      }

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...user, ...profile }));
      window.dispatchEvent(new Event('profile-updated'));
      toast.success('Personal profile synchronized');
    } catch (err) {
      toast.error('Profile update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfile(prev => ({ ...prev, avatar: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Pricing Handlers ---
  const handleSavePricing = () => {
    localStorage.setItem('crm_pricing_plans', JSON.stringify(plans));
    window.dispatchEvent(new Event('pricing-updated'));
    toast.success('Pricing plans published!');
  };

  const updatePlan = (id: string, field: keyof PricingPlan, value: any) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  // --- Template Handlers ---
  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const isEditing = !!editingTemplate;
      const apiPath = isEditing && editingTemplate.isSystem ? `/tenants/system/templates/${editingTemplate.id}` : 
                      isEditing ? `/communications/templates/${editingTemplate.id}` : 
                      '/communications/templates';
      
      if (isEditing) {
        await api.put(apiPath, newTemplate);
      } else {
        await api.post(apiPath, newTemplate);
      }
      
      toast.success(isEditing ? 'Updated!' : 'Created!');
      setShowTemplateModal(false);
      setEditingTemplate(null);
      setNewTemplate({ name: '', subject: '', content: '', category: 'GENERAL' });
      fetchInitialData();
    } catch (err) { toast.error('Failed'); } finally { setLoading(false); }
  };

  const handleEditTemplate = (tpl: any) => {
    setEditingTemplate(tpl);
    setNewTemplate({
      name: tpl.name || '',
      subject: tpl.subject || '',
      content: tpl.content || '',
      category: tpl.category || 'GENERAL'
    });
    setShowTemplateModal(true);
  };

  // --- Pipeline Handlers ---
  const handleCreatePipeline = async () => {
    setLoading(true);
    try {
      if (editingPipeline) {
         await api.put(`/pipelines/${editingPipeline.id}`, newPipeline);
         toast.success('Pipeline Updated');
      } else {
         await api.post('/pipelines', newPipeline);
         toast.success('Pipeline Initialized');
      }
      setShowPipelineModal(false);
      setEditingPipeline(null);
      fetchInitialData();
    } catch (err) { toast.error('Failed'); } finally { setLoading(false); }
  };

  const handleEditPipeline = (p: any) => {
    setEditingPipeline(p);
    setNewPipeline({
      name: p.name || '',
      stages: p.stages.map((s: any) => ({ name: s.name, color: s.color, probability: s.probability, order: s.order }))
    });
    setShowPipelineModal(true);
  };

  const handleDeletePipeline = async (id: string) => {
    if (!confirm('Are you sure? This will fail if deals are using this pipeline.')) return;
    try {
      await api.delete(`/pipelines/${id}`);
      toast.success('Deleted');
      fetchInitialData();
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const addStageToNew = () => {
    setNewPipeline({
      ...newPipeline,
      stages: [...newPipeline.stages, { name: 'New Stage', color: '#6366f1', probability: 50, order: newPipeline.stages.length + 1 }]
    });
  };

  const updateStageInNew = (index: number, field: string, value: any) => {
    const updated = [...newPipeline.stages];
    updated[index] = { ...updated[index], [field]: value };
    setNewPipeline({ ...newPipeline, stages: updated });
  };

  const removeStageFromNew = (index: number) => {
    const updated = newPipeline.stages.filter((_, i) => i !== index);
    setNewPipeline({ ...newPipeline, stages: updated });
  };

  // --- Module Handlers ---
  const handleSaveModules = () => {
    const disabledIds = ALL_MODULES.map(m => m.id).filter(id => !enabledModules.includes(id));
    localStorage.setItem('global_disabled_modules', JSON.stringify(disabledIds));
    toast.success('Architecture configuration saved!');
    setTimeout(() => window.location.reload(), 1000);
  };

  // --- SSO Handlers ---
  const handleSaveSso = () => {
    localStorage.setItem('crm_sso_providers', JSON.stringify(ssoProviders));
    toast.success('SSO configuration saved!');
  };

  // --- Stats Handlers ---
  const handleSaveStats = () => {
    localStorage.setItem('dashboard_stats_prefs', JSON.stringify(preferences));
    toast.success('Dashboard layout saved!');
    window.dispatchEvent(new Event('dashboard-prefs-updated'));
  };

  // --- Domain Handlers ---
  const handleProvisionSubdomain = async () => {
    if (!domainSettings.subdomain) return toast.error('Please enter a subdomain prefix');
    setLoading(true);
    try {
      const res = await api.post(`/tenants/${tenant.id}/provision-subdomain`, { baseName: domainSettings.subdomain });
      setDomainSettings(prev => ({ ...prev, subdomain: res.subdomain }));
      toast.success('Subdomain provisioned successfully');
      fetchTenantData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to provision subdomain');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCustomDomain = async () => {
    if (!domainSettings.customDomain) return toast.error('Please enter a custom domain');
    setLoading(true);
    try {
      await api.patch(`/tenants/${tenant.id}/branding`, { customDomain: domainSettings.customDomain });
      toast.success('Custom domain saved. Please verify DNS to activate.');
      fetchTenantData();
    } catch (err: any) {
      toast.error('Failed to save domain');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCustomDomain = async () => {
    if (!domainSettings.customDomain) return toast.error('Please enter a custom domain');
    setLoading(true);
    try {
      const res = await api.post(`/tenants/${tenant.id}/verify-custom-domain`, { customDomain: domainSettings.customDomain });
      if (res.domainVerified) {
        toast.success('Custom domain verified successfully!');
      } else {
        toast.error('Verification failed. Please check your DNS settings.');
      }
      fetchTenantData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'branding', label: 'Identity', icon: Palette },
    ...(isSuperAdmin ? [
      { id: 'pricing', label: 'Pricing', icon: CreditCard },
      { id: 'sso', label: 'SSO Logins', icon: Globe },
      { id: 'templates', label: 'Email', icon: Mail },
      { id: 'modules', label: 'Modules', icon: ShieldCheck },
      { id: 'pipelines', label: 'Pipelines', icon: GitBranch },
      { id: 'infrastructure', label: 'Infrastructure', icon: Server },
    ] : [
      { id: 'subscription', label: 'Payment', icon: CreditCard },
      { id: 'domain', label: 'Domain', icon: Globe },
    ]),
    { id: 'stats', label: 'Dashboard', icon: LayoutGrid },
  ] as const;

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-10 pb-20">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-foreground tracking-tight">System Control</h1>
            <p className="text-muted-foreground font-medium">Global configuration for the entire CRM infrastructure.</p>
          </div>
          
          <div className="flex bg-muted/50 p-1.5 rounded-2xl border border-border shadow-sm overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'bg-background text-primary shadow-md border border-border/50' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </header>

        <main className="bg-card border border-border rounded-[50px] p-12 premium-shadow min-h-[600px] relative overflow-hidden group/main">
           {fetching && (
             <div className="absolute inset-0 z-50 bg-background/50 backdrop-blur-sm flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                   <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                   <p className="text-xs font-black uppercase tracking-widest text-primary animate-pulse">Syncing Control Data...</p>
                </div>
             </div>
           )}

           {activeTab === 'profile' && (
             <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                {mustChangePassword && (
                  <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl flex items-start space-x-4 animate-pulse">
                    <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-black text-amber-500 mb-1">Password Update Required</h3>
                      <p className="text-sm font-bold text-amber-600/80">For security, please set a new password to unlock full workspace access.</p>
                    </div>
                  </div>
                )}

                <section className="space-y-8">
                   <h3 className="text-lg font-black text-foreground flex items-center gap-4">
                      <span className="w-1.5 h-8 bg-purple-500 rounded-full shadow-lg shadow-purple-500/20" />
                      Personal Profile
                   </h3>
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                      <div className="flex flex-col items-center space-y-6">
                         <div className="relative group">
                            <div className="w-32 h-32 rounded-[32px] bg-gradient-to-tr from-purple-500 to-primary p-1 overflow-hidden shadow-xl">
                               {profile.avatar ? (
                                 <img src={profile.avatar} className="w-full h-full object-cover rounded-[28px]" />
                               ) : (
                                 <div className="w-full h-full rounded-[28px] bg-background flex items-center justify-center text-3xl font-black text-primary">
                                    {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
                                 </div>
                               )}
                            </div>
                            <button onClick={() => avatarInputRef.current?.click()} className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-xl flex items-center justify-center border-4 border-background text-white shadow-lg"><Camera className="w-5 h-5" /></button>
                            <input type="file" ref={avatarInputRef} onChange={handleImageUpload} className="hidden" />
                         </div>
                         <div className="text-center">
                            <p className="text-xs font-bold text-foreground">{profile.email}</p>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{profile.role.replace('_', ' ')}</p>
                         </div>
                      </div>
                      
                      <div className="lg:col-span-2 space-y-6">
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                               <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">First Name</label>
                               <input type="text" value={profile.firstName} onChange={e => setProfile({...profile, firstName: e.target.value})} className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary" />
                            </div>
                            <div className="space-y-1">
                               <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Last Name</label>
                               <input type="text" value={profile.lastName} onChange={e => setProfile({...profile, lastName: e.target.value})} className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary" />
                            </div>
                         </div>
                         <PasswordField
                           id="password"
                           label="Security Credentials (New Password)"
                           value={profile.password}
                           onChange={val => setProfile({...profile, password: val})}
                           className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm font-bold"
                           showIcon={false}
                         />
                         <button onClick={handleSaveProfile} className="px-8 py-3 bg-foreground text-background rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all">Update Profile</button>
                      </div>
                   </div>
                </section>
             </div>
           )}

           {activeTab === 'branding' && (
             <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                {isSuperAdmin ? (
                  <form onSubmit={handleSaveBranding} className="space-y-12">
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        <div className="space-y-10">
                           <section className="space-y-6">
                              <h3 className="text-lg font-black text-foreground flex items-center gap-4">
                                 <span className="w-1.5 h-8 bg-primary rounded-full shadow-lg shadow-primary/20" />
                                 Global Identity
                              </h3>
                              <div className="space-y-6">
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Platform Name</label>
                                    <input type="text" value={settings.systemName || ''} onChange={e => setSettings({...settings, systemName: e.target.value})} className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold" />
                                 </div>
                                 <div className="grid grid-cols-3 gap-4">
                                    <ColorPicker label="Primary" color={settings.primaryColor || '#6366f1'} onChange={c => setSettings({...settings, primaryColor: c})} />
                                    <ColorPicker label="Secondary" color={settings.secondaryColor || '#4f46e5'} onChange={c => setSettings({...settings, secondaryColor: c})} />
                                    <ColorPicker label="Accent" color={settings.accentColor || '#f59e0b'} onChange={c => setSettings({...settings, accentColor: c})} />
                                 </div>
                              </div>
                           </section>
                           <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/30">SAVE SYSTEM BRANDING</button>
                        </div>
                        <div className="space-y-6 p-8 bg-muted/30 rounded-[40px] border border-border/50">
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Meta Data</h4>
                           <input type="text" value={settings.metaDescription || ''} onChange={e => setSettings({...settings, metaDescription: e.target.value})} placeholder="SEO Description" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs font-bold" />
                           <input type="text" value={settings.logoUrl || ''} onChange={e => setSettings({...settings, logoUrl: e.target.value})} placeholder="Logo URL" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs font-bold mt-2" />
                        </div>
                     </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                     <div className="space-y-10">
                        <section className="space-y-6">
                           <h3 className="text-lg font-black text-foreground flex items-center gap-4">
                              <span className="w-1.5 h-8 bg-primary rounded-full shadow-lg shadow-primary/20" />
                              Identity Branding
                           </h3>
                           <div className="space-y-6">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Workspace Name</label>
                                 <input type="text" value={workspaceBranding.name || ''} onChange={e => setWorkspaceBranding({...workspaceBranding, name: e.target.value})} className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                 <ColorPicker label="Primary" color={workspaceBranding.primaryColor || '#6366f1'} onChange={c => setWorkspaceBranding({...workspaceBranding, primaryColor: c})} />
                                 <ColorPicker label="Secondary" color={workspaceBranding.secondaryColor || '#4f46e5'} onChange={c => setWorkspaceBranding({...workspaceBranding, secondaryColor: c})} />
                                 <ColorPicker label="Accent" color={workspaceBranding.accentColor || '#f59e0b'} onChange={c => setWorkspaceBranding({...workspaceBranding, accentColor: c})} />
                              </div>
                           </div>
                        </section>
                        <button onClick={handleSaveWorkspaceBranding} disabled={loading} className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/30 hover:opacity-90 transition-all flex items-center justify-center gap-3">
                           <Save className="w-5 h-5" />
                           {loading ? 'Processing...' : 'Deploy Branding Updates'}
                        </button>
                     </div>
                     <div className="space-y-8">
                        <div className="p-10 bg-muted/30 rounded-[60px] border border-border/50 relative overflow-hidden">
                           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-8 opacity-60">System Identity Preview</p>
                           <div className="bg-background rounded-[32px] border border-border overflow-hidden shadow-2xl p-10 flex items-center gap-6">
                              <div className="w-16 h-16 rounded-[22px] flex items-center justify-center shadow-2xl" style={{ backgroundColor: workspaceBranding.primaryColor || '#6366f1' }}>
                                 {workspaceBranding.logoUrl ? <img src={workspaceBranding.logoUrl} className="w-10 h-10 object-contain" /> : <Building2 className="w-8 h-8 text-white" />}
                              </div>
                              <div>
                                 <div className="text-sm font-black text-foreground tracking-tight">{workspaceBranding.name || 'Your Brand Name'}</div>
                                 <div className="h-2 w-24 bg-muted rounded-full mt-1 opacity-50" />
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                )}
             </div>
           )}

           {activeTab === 'pricing' && (
             <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                <div className="flex justify-between items-center">
                   <h2 className="text-xl font-black">Subscription Tiers</h2>
                   <button onClick={handleSavePricing} className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">PUBLISH PLANS</button>
                </div>
                <div className="space-y-6">
                   {plans.map(plan => (
                     <div key={plan.id} className="p-8 bg-muted/20 border border-border rounded-[40px] flex flex-col md:flex-row gap-8">
                        <div className="flex-1 space-y-4">
                           <input value={plan.name || ''} onChange={e => updatePlan(plan.id, 'name', e.target.value)} className="bg-transparent border-none text-xl font-black p-0 focus:ring-0" />
                           <div className="flex gap-4">
                              <input value={plan.price || ''} onChange={e => updatePlan(plan.id, 'price', e.target.value)} className="bg-background border border-border rounded-xl px-4 py-2 text-sm font-bold w-32" />
                              <input value={plan.period || ''} onChange={e => updatePlan(plan.id, 'period', e.target.value)} className="bg-background border border-border rounded-xl px-4 py-2 text-sm font-bold w-32" />
                           </div>
                        </div>
                        <div className="flex-1">
                           <RichTextEditor value={plan.description || ''} onChange={(html: string) => updatePlan(plan.id, 'description', html)} />
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           )}

           {activeTab === 'sso' && (
             <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                <div className="flex justify-between items-center">
                   <div>
                      <h2 className="text-xl font-black">SSO Providers</h2>
                      <p className="text-sm text-muted-foreground font-medium">Configure which social logins are available on the registration page.</p>
                   </div>
                   <button onClick={handleSaveSso} className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">SAVE CONFIG</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   {Object.entries(ssoProviders).map(([provider, enabled]) => (
                     <div key={provider} className="p-6 bg-muted/20 border border-border rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-background rounded-xl border border-border flex items-center justify-center font-bold capitalize">
                             {provider.charAt(0)}
                           </div>
                           <div>
                             <h4 className="font-bold capitalize text-foreground">{provider}</h4>
                           </div>
                        </div>
                        <button 
                           onClick={() => setSsoProviders(prev => ({...prev, [provider]: !enabled}))}
                           className={`w-12 h-6 rounded-full transition-colors relative ${enabled ? 'bg-primary' : 'bg-muted border border-border'}`}
                        >
                           <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${enabled ? 'left-7' : 'left-1'}`} />
                        </button>
                     </div>
                   ))}
                </div>
             </div>
           )}

           {activeTab === 'templates' && (
             <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                <div className="flex justify-between items-center">
                   <h2 className="text-xl font-black">Email Templates</h2>
                   <button onClick={() => { setEditingTemplate(null); setNewTemplate({ name: '', subject: '', content: '', category: 'GENERAL' }); setShowTemplateModal(true); }} className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2"><Plus className="w-4 h-4" /> CREATE TEMPLATE</button>
                </div>
                {fetching ? (
                  <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div>
                ) : customTemplates.length === 0 ? (
                  <div className="py-20 text-center opacity-50"><p className="font-bold">No system or communication templates found.</p></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {customTemplates.map(t => (
                      <div key={t.id} onClick={() => handleEditTemplate(t)} className="p-8 bg-muted/20 border border-border rounded-[40px] hover:border-primary/40 transition-all cursor-pointer group">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-base font-black">{t.name || 'Untitled Template'}</h3>
                            <div className="flex items-center gap-2">
                              {t.isSystem && <span className="bg-primary/10 text-primary text-[8px] font-black uppercase px-2 py-1 rounded">System</span>}
                              <Edit3 className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-4 italic">Subject: {t.subject || 'No Subject'}</p>
                          <div className="text-xs text-muted-foreground line-clamp-3" dangerouslySetInnerHTML={{ __html: t.content || '' }} />
                      </div>
                    ))}
                  </div>
                )}
             </div>
           )}

           {activeTab === 'modules' && (
             <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                <div className="flex justify-between items-center">
                   <div>
                      <h2 className="text-xl font-black">Service Architecture</h2>
                      <p className="text-sm text-muted-foreground font-medium">Toggle core features availability across the platform.</p>
                   </div>
                   <button onClick={handleSaveModules} className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">SAVE ARCHITECTURE</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {ALL_MODULES.map(m => {
                     const isEnabled = enabledModules.includes(m.id);
                     return (
                       <div key={m.id} onClick={() => setEnabledModules(prev => isEnabled ? prev.filter(x => x !== m.id) : [...prev, m.id])} className={`p-8 rounded-[32px] border transition-all cursor-pointer ${isEnabled ? 'bg-card border-primary/20' : 'bg-muted/30 opacity-60 grayscale'}`}>
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${m.color}`}><m.icon className="w-6 h-6" /></div>
                          <h4 className="font-black text-lg mb-2">{m.name}</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
                       </div>
                     );
                   })}
                </div>
             </div>
           )}

            {activeTab === 'infrastructure' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                 <div className="flex justify-between items-start gap-8">
                    <div className="flex-1 space-y-10">
                       <section className="space-y-6">
                          <h3 className="text-lg font-black text-foreground flex items-center gap-4">
                             <span className="w-1.5 h-8 bg-amber-500 rounded-full shadow-lg shadow-amber-500/20" />
                             System Infrastructure
                          </h3>
                          
                          <div className="space-y-8">
                             <div className="p-8 bg-amber-500/5 border border-amber-500/10 rounded-[32px] flex items-start gap-6">
                                <Database className="w-8 h-8 text-amber-500 shrink-0 mt-1" />
                                <div>
                                   <h4 className="text-sm font-black text-amber-600 uppercase tracking-widest mb-1">Message Broker / Worker Node</h4>
                                   <p className="text-xs text-muted-foreground leading-relaxed">
                                      The CRM relies on a high-performance message broker for background job processing (Imports, Campaigns, AI Tasks). 
                                      You can use standard Redis or highly scalable drop-in alternatives like Dragonfly or KeyDB.
                                   </p>
                                </div>
                             </div>

                             <div className="space-y-6">
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Broker Engine</label>
                                   <div className="relative">
                                      <select 
                                         value={settings.brokerType} 
                                         onChange={e => setSettings({...settings, brokerType: e.target.value})} 
                                         className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-5 text-sm font-bold focus:ring-4 focus:ring-amber-500/10 outline-none transition-all appearance-none cursor-pointer" 
                                      >
                                         <option value="redis">Redis (Standard Engine)</option>
                                         <option value="dragonfly">Dragonfly (Multi-threaded & High Throughput)</option>
                                         <option value="keydb">KeyDB (Fast Drop-in Replacement)</option>
                                         <option value="upstash">Upstash (Serverless Redis)</option>
                                         <option value="postgres">PostgreSQL / Sync (Fallback for low-volume)</option>
                                      </select>
                                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                         <ChevronRight className="w-4 h-4 rotate-90" />
                                      </div>
                                   </div>
                                </div>

                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Broker Connection URI</label>
                                   <div className="relative group">
                                      <Zap className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-amber-500 transition-colors" />
                                      <input 
                                         type="text" 
                                         value={settings.redisUri} 
                                         onChange={e => setSettings({...settings, redisUri: e.target.value})} 
                                         placeholder={settings.brokerType === 'upstash' ? 'rediss://...' : 'redis://localhost:6379'}
                                         disabled={settings.brokerType === 'postgres'}
                                         className={`w-full bg-muted/50 border border-border rounded-2xl pl-14 pr-6 py-5 text-sm font-bold focus:ring-4 focus:ring-amber-500/10 outline-none transition-all ${settings.brokerType === 'postgres' ? 'opacity-50 cursor-not-allowed' : ''}`} 
                                      />
                                   </div>
                                   {settings.brokerType === 'postgres' && (
                                     <p className="text-[10px] text-rose-500 font-bold ml-1 mt-2">Postgres fallback bypasses the external broker. Not recommended for files &gt; 5MB.</p>
                                   )}
                                </div>

                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">MCP Protocol Server</label>
                                   <div className="relative group">
                                      <Cpu className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-amber-500 transition-colors" />
                                      <input 
                                         type="text" 
                                         value={settings.mcpServerUrl} 
                                         onChange={e => setSettings({...settings, mcpServerUrl: e.target.value})} 
                                         placeholder="http://localhost:3012"
                                         className="w-full bg-muted/50 border border-border rounded-2xl pl-14 pr-6 py-5 text-sm font-bold focus:ring-4 focus:ring-amber-500/10 outline-none transition-all" 
                                      />
                                   </div>
                                </div>
                             </div>
                          </div>
                       </section>

                       <button 
                         onClick={handleSaveBranding}
                         disabled={loading}
                         className="px-12 py-5 bg-amber-500 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-amber-500/30 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3"
                       >
                          <Save className="w-5 h-5" />
                          Deploy Infrastructure Update
                       </button>
                    </div>

                    <div className="w-80 space-y-6">
                       <div className="p-8 bg-card border border-border rounded-[40px] shadow-sm">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Node Health Check</p>
                          <div className="space-y-4">
                             <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold">Redis Cluster</span>
                                <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50"></span>
                             </div>
                             <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold">MCP Core</span>
                                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                             </div>
                             <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold">Import Worker</span>
                                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            )}

           {activeTab === 'pipelines' && (
             <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                <div className="flex justify-between items-center">
                   <div>
                      <h2 className="text-xl font-black text-foreground mb-2 flex items-center">
                         <GitBranch className="w-8 h-8 mr-4 text-primary" />
                         Deal Pipelines
                      </h2>
                      <p className="text-muted-foreground text-sm font-medium">Define your sales funnel stages, probabilities, and colors.</p>
                   </div>
                   <button 
                     onClick={() => { setEditingPipeline(null); setNewPipeline({ name: '', stages: [{ name: 'Qualification', color: '#6366f1', probability: 20, order: 1 }, { name: 'Meeting', color: '#f59e0b', probability: 40, order: 2 }, { name: 'Proposal', color: '#3b82f6', probability: 60, order: 3 }, { name: 'Closing', color: '#8b5cf6', probability: 80, order: 4 }] }); setShowPipelineModal(true); }}
                     className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/25 hover:opacity-90 transition-all flex items-center"
                   >
                     <Plus className="w-5 h-5 mr-2" />
                     CREATE PIPELINE
                   </button>
                </div>

                <div className="grid grid-cols-1 gap-6 pt-6">
                   {fetching ? (
                     <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div>
                   ) : pipelines.length === 0 ? (
                     <div className="glass-card p-20 text-center rounded-[40px] border border-border border-dashed">
                        <Layout className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
                        <h3 className="text-base font-bold text-foreground">No pipelines defined</h3>
                        <p className="text-muted-foreground mt-2 max-w-xs mx-auto text-sm">Create your first sales pipeline to start tracking opportunities.</p>
                     </div>
                   ) : (
                     pipelines.map((p) => (
                       <div key={p.id} className="p-8 bg-muted/20 border border-border rounded-[40px] hover:border-primary/30 transition-all group">
                          <div className="flex justify-between items-start mb-8">
                             <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                                   <Target className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                   <h3 className="text-base font-black text-foreground flex items-center">
                                     {p.name}
                                     {p.isDefault && <span className="ml-3 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest rounded-md">Default</span>}
                                   </h3>
                                   <p className="text-xs text-muted-foreground font-bold mt-1 uppercase tracking-widest">{p.stages?.length || 0} Stages • {p._count?.deals || 0} Deals</p>
                                </div>
                             </div>
                             <div className="flex space-x-2">
                                <button onClick={() => handleEditPipeline(p)} className="p-3 bg-background/50 hover:bg-primary hover:text-white rounded-xl transition-all shadow-sm">
                                   <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeletePipeline(p.id)}
                                  className="p-3 bg-background/50 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                                >
                                   <Trash2 className="w-4 h-4" />
                                </button>
                             </div>
                          </div>

                          <div className="flex items-center space-x-2 overflow-x-auto pb-4 scrollbar-hide">
                             {p.stages?.map((stage: any, idx: number) => (
                               <React.Fragment key={stage.id}>
                                 <div className="flex-1 min-w-[160px] p-4 rounded-2xl border border-border bg-background/30 relative group/stage">
                                    <div className="flex items-center justify-between mb-3">
                                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }}></div>
                                       <span className="text-[10px] font-black text-muted-foreground">{stage.probability}%</span>
                                    </div>
                                    <p className="text-xs font-black text-foreground uppercase tracking-widest truncate">{stage.name}</p>
                                 </div>
                                 {idx < p.stages.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground/30 shrink-0" />}
                               </React.Fragment>
                             ))}
                          </div>
                       </div>
                     ))
                   )}
                </div>
             </div>
           )}

           {activeTab === 'subscription' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center justify-center h-[500px] text-center space-y-8">
                <div className="w-24 h-24 bg-primary/10 rounded-[40px] flex items-center justify-center relative"><CreditCard className="w-10 h-10 text-primary" /></div>
                <div className="space-y-3">
                   <h2 className="text-xl font-black">Billing & Subscriptions</h2>
                   <p className="text-muted-foreground max-w-sm mx-auto font-medium">Manage your current plan, view billing history, and upgrade workspace capacity.</p>
                </div>
                <button onClick={() => window.location.href = '/dashboard/settings/subscription'} className="px-10 py-5 bg-primary text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/20">Open Billing Dashboard</button>
             </div>
           )}

           {activeTab === 'domain' && (
             <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                <section className="space-y-6">
                   <h3 className="text-lg font-black text-foreground flex items-center gap-4">
                      <span className="w-1.5 h-8 bg-primary rounded-full shadow-lg shadow-primary/20" />
                      Domain Configuration
                   </h3>
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      
                      {/* Subdomain Settings */}
                      <div className="space-y-6 p-8 bg-muted/30 rounded-[40px] border border-border/50">
                         <div className="flex items-center gap-3 mb-2">
                            <Globe className="w-6 h-6 text-primary" />
                            <h4 className="text-lg font-black uppercase tracking-widest text-foreground">Subdomain</h4>
                         </div>
                         <p className="text-xs text-muted-foreground font-medium mb-4">
                           Get a free `.crm.com` subdomain for your workspace.
                         </p>
                         <div className="flex items-center">
                            <input 
                              type="text" 
                              value={domainSettings.subdomain || ''} 
                              onChange={e => setDomainSettings({...domainSettings, subdomain: e.target.value})} 
                              placeholder="your-brand" 
                              className="flex-1 bg-background border border-r-0 border-border rounded-l-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary" 
                            />
                            <div className="bg-muted border border-l-0 border-border rounded-r-2xl px-4 py-3 text-sm font-bold text-muted-foreground">
                              .crm.com
                            </div>
                         </div>
                         <button 
                           onClick={handleProvisionSubdomain} 
                           disabled={loading || !tenant || tenant.id === 'system'} 
                           className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 transition-all mt-4 disabled:opacity-50">
                           Provision Subdomain
                         </button>
                      </div>

                      {/* Custom Domain Settings */}
                      <div className="space-y-6 p-8 bg-muted/30 rounded-[40px] border border-border/50">
                         <div className="flex items-center gap-3 mb-2">
                            <LinkIcon className="w-6 h-6 text-primary" />
                            <h4 className="text-lg font-black uppercase tracking-widest text-foreground">Custom Domain</h4>
                         </div>
                         <p className="text-xs text-muted-foreground font-medium mb-4">
                           Connect your own domain. Add a CNAME record pointing to <span className="font-bold text-foreground px-2 py-1 bg-muted rounded">{domainSettings.subdomain ? `${domainSettings.subdomain}.crm.com` : 'your-subdomain.crm.com'}</span>.
                         </p>
                         <div className="space-y-2">
                            <input 
                              type="text" 
                              value={domainSettings.customDomain || ''} 
                              onChange={e => setDomainSettings({...domainSettings, customDomain: e.target.value})} 
                              placeholder="crm.yourcompany.com" 
                              className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary" 
                            />
                         </div>
                         <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                              Status: 
                              <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest ${domainSettings.domainVerified ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                {domainSettings.domainVerified ? 'VERIFIED' : domainSettings.domainStatus}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={handleSaveCustomDomain} 
                                disabled={loading || !tenant || tenant.id === 'system'} 
                                className="px-4 py-3 bg-muted text-foreground border border-border rounded-xl font-black text-xs uppercase tracking-widest hover:bg-background transition-all disabled:opacity-50">
                                Save
                              </button>
                              <button 
                                onClick={handleVerifyCustomDomain} 
                                disabled={loading || !tenant || tenant.id === 'system'} 
                                className="px-6 py-3 bg-foreground text-background rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50">
                                Verify DNS
                              </button>
                            </div>
                         </div>
                      </div>

                   </div>
                </section>
             </div>
           )}

           {activeTab === 'stats' && (
             <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                <div className="flex justify-between items-center">
                   <div>
                      <h2 className="text-xl font-black">Dashboard Canvas</h2>
                      <p className="text-sm text-muted-foreground font-medium">Define the default visibility of analytics widgets.</p>
                   </div>
                   <button onClick={handleSaveStats} className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">SAVE PREFERENCES</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {STAT_OPTIONS.map(opt => {
                     const active = preferences.includes(opt.id);
                     return (
                       <div key={opt.id} onClick={() => setPreferences(prev => active ? prev.filter(x => x !== opt.id) : [...prev, opt.id])} className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${active ? 'border-primary bg-primary/5 shadow-inner' : 'border-border grayscale opacity-70'}`}>
                          <div>
                             <h5 className="font-bold text-sm">{opt.label}</h5>
                             <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                          </div>
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${active ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-muted'}`}><Check className="w-3 h-3" /></div>
                       </div>
                     );
                   })}
                </div>
             </div>
           )}
        </main>
      {/* Modals moved inside the main div */}

      <PremiumModal isOpen={showTemplateModal} onClose={() => { setShowTemplateModal(false); setEditingTemplate(null); }} title={editingTemplate ? "Edit Template" : "Template Designer"}>
         <div className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Template Name</label>
               <input value={newTemplate.name || ''} onChange={e => setNewTemplate({...newTemplate, name: e.target.value})} placeholder="Template Name" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm font-bold" />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Email Subject</label>
               <input value={newTemplate.subject || ''} onChange={e => setNewTemplate({...newTemplate, subject: e.target.value})} placeholder="Subject" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm font-bold" />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Content</label>
               <RichTextEditor value={newTemplate.content || ''} onChange={(html: string) => setNewTemplate({...newTemplate, content: html})} />
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mt-2">
               <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" /> Available Dynamic Tags
               </p>
               <div className="flex flex-wrap gap-2">
                  {['{{lead.first_name}}', '{{lead.last_name}}', '{{lead.email}}', '{{lead.phone}}', '{{lead.company}}'].map(tag => (
                     <span 
                        key={tag} 
                        className="px-2.5 py-1.5 bg-background rounded-lg text-[10px] font-mono font-bold border border-border shadow-sm cursor-pointer hover:border-primary hover:text-primary transition-all active:scale-95" 
                        onClick={() => {
                           navigator.clipboard.writeText(tag);
                           toast.success(`Copied ${tag} to clipboard`);
                        }}
                     >
                        {tag}
                     </span>
                  ))}
               </div>
               <p className="text-[9px] text-muted-foreground mt-3 font-medium italic">Click any tag above to copy it, then paste it into your subject or content.</p>
            </div>
            <button onClick={handleCreateTemplate} className="w-full py-4 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest">
               {editingTemplate ? "UPDATE TEMPLATE" : "SAVE TEMPLATE"}
            </button>
         </div>
      </PremiumModal>

      <PremiumModal 
        isOpen={showPipelineModal} 
        onClose={() => setShowPipelineModal(false)} 
        title={editingPipeline ? "Modify Pipeline" : "Pipeline Factory"}
        subtitle="Define your sales process"
        maxWidth="max-w-4xl"
      >
         <div className="space-y-8">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Pipeline Name</label>
               <input 
                 value={newPipeline.name || ''} 
                 onChange={e => setNewPipeline({...newPipeline, name: e.target.value})} 
                 placeholder="e.g. Enterprise Sales Funnel" 
                 className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" 
               />
            </div>

            <div className="space-y-4">
               <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Stages & Milestones</label>
                  <button 
                    onClick={addStageToNew}
                    className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center"
                  >
                     <Plus className="w-3 h-3 mr-1" /> Add Stage
                  </button>
               </div>

               <div className="space-y-3">
                  {newPipeline.stages.map((stage, idx) => (
                    <div key={idx} className="flex items-center space-x-4 p-4 bg-muted/30 rounded-2xl border border-border group">
                       <GripVertical className="w-4 h-4 text-muted-foreground/30 cursor-grab" />
                       <input 
                         type="color" 
                         value={stage.color || '#6366f1'} 
                         onChange={e => updateStageInNew(idx, 'color', e.target.value)}
                         className="w-8 h-8 rounded-lg overflow-hidden border-none bg-transparent cursor-pointer" 
                       />
                       <input 
                         value={stage.name || ''} 
                         onChange={e => updateStageInNew(idx, 'name', e.target.value)}
                         placeholder="Stage Name"
                         className="flex-1 bg-transparent border-none text-sm font-bold focus:outline-none"
                       />
                       <div className="flex items-center space-x-2 bg-background/50 px-3 py-1.5 rounded-xl border border-border">
                         <span className="text-[10px] font-black text-muted-foreground">PROB:</span>
                         <input 
                           type="number"
                           value={stage.probability || 0}
                           onChange={e => updateStageInNew(idx, 'probability', parseInt(e.target.value))}
                           className="w-12 bg-transparent border-none text-[10px] font-black text-primary text-center focus:outline-none"
                         />
                         <span className="text-[10px] font-black text-muted-foreground">%</span>
                       </div>
                       <button 
                         onClick={() => removeStageFromNew(idx)}
                         className="p-2 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                       >
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  ))}
               </div>
            </div>

            <button onClick={handleCreatePipeline} className="w-full py-5 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/25 hover:opacity-90 transition-all">
               {editingPipeline ? "UPDATE PIPELINE" : "INITIALIZE PIPELINE"}
            </button>
         </div>
      </PremiumModal>
    </div>
  );
}

function ColorPicker({ label, color, onChange }: { label: string, color: string, onChange: (c: string) => void }) {
  return (
    <div className="p-4 bg-muted/40 rounded-2xl border border-border/60 hover:border-primary/40 transition-all group">
       <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-2">{label}</p>
       <div className="flex items-center gap-2">
          <input type="color" value={color || '#6366f1'} onChange={e => onChange(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent" />
          <span className="text-[9px] font-mono font-bold">{color || '#6366f1'}</span>
       </div>
    </div>
  );
}
