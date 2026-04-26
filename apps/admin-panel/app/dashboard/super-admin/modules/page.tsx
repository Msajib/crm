'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'react-hot-toast';
import { 
  LayoutGrid, 
  Save, 
  Globe, 
  Sparkles, 
  MessageSquare, 
  BarChart3, 
  CreditCard, 
  ShieldCheck,
  Zap,
  Target
} from 'lucide-react';

const ALL_MODULES = [
  { id: 'tasks', name: 'Tasks Module', desc: 'Task management, Kanban boards, and team collaboration.', icon: LayoutGrid, color: 'text-blue-500 bg-blue-500/10' },
  { id: 'deals', name: 'Deals & Pipeline', desc: 'Sales pipeline management and revenue forecasting.', icon: Target, color: 'text-emerald-500 bg-emerald-500/10' },
  { id: 'marketing', name: 'Marketing Hub', desc: 'Social account connections and automated campaigns.', icon: Zap, color: 'text-amber-500 bg-amber-500/10' },
  { id: 'communication', name: 'Communication', desc: 'Centralized business calls, emails, and SMS.', icon: MessageSquare, color: 'text-indigo-500 bg-indigo-500/10' },
  { id: 'ai', name: 'AI Sales Agent', desc: 'Predictive lead scoring and automated AI assistance.', icon: Sparkles, color: 'text-purple-500 bg-purple-500/10' },
  { id: 'analytics', name: 'Advanced Analytics', desc: 'Deep insights and custom reporting dashboards.', icon: BarChart3, color: 'text-rose-500 bg-rose-500/10' },
  { id: 'payments', name: 'Payment Gateways', desc: 'Stripe, PayPal and regional gateway integrations.', icon: CreditCard, color: 'text-cyan-500 bg-cyan-500/10' },
];

export default function SuperAdminModulesSettings() {
  const [loading, setLoading] = useState(false);
  const [enabledModules, setEnabledModules] = useState<string[]>(ALL_MODULES.map(m => m.id));

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('global_disabled_modules');
      if (saved) {
        const disabledIds = JSON.parse(saved);
        setEnabledModules(ALL_MODULES.map(m => m.id).filter(id => !disabledIds.includes(id)));
      }
    }
  }, []);

  const handleToggle = (id: string) => {
    setEnabledModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const disabledIds = ALL_MODULES.map(m => m.id).filter(id => !enabledModules.includes(id));
      localStorage.setItem('global_disabled_modules', JSON.stringify(disabledIds));
      toast.success('Global module preferences updated successfully!', {
        icon: '🌍',
        style: { borderRadius: '20px', background: '#1e293b', color: '#fff' }
      });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error('Failed to update global modules');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-6xl mx-auto space-y-12">
        <header className="relative py-12 px-8 overflow-hidden rounded-[40px] bg-card border border-border">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-black text-foreground mb-3 flex items-center">
              <ShieldCheck className="w-10 h-10 mr-4 text-primary" />
              Service Control Center
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Manage the core architecture and feature availability across the entire CRM ecosystem. 
              Changes here affect all tenants globally.
            </p>
          </div>
        </header>

        <form onSubmit={handleSave} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ALL_MODULES.map(module => {
              const isEnabled = enabledModules.includes(module.id);
              const Icon = module.icon;

              return (
                <div 
                  key={module.id} 
                  className={`relative p-8 rounded-[32px] border transition-all duration-300 group cursor-pointer ${
                    isEnabled 
                      ? 'bg-card border-primary/20 shadow-xl shadow-primary/5' 
                      : 'bg-muted/30 border-border grayscale opacity-70'
                  }`}
                  onClick={() => handleToggle(module.id)}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${module.color}`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer pointer-events-none">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={isEnabled} 
                        readOnly
                      />
                      <div className="w-12 h-6 bg-muted/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{module.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{module.desc}</p>
                  </div>

                  {isEnabled && (
                    <div className="mt-6 flex items-center space-x-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Globally</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-center md:justify-end pt-8">
            <button
              disabled={loading}
              className="px-12 py-5 bg-primary hover:opacity-90 text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] flex items-center space-x-3 transition-all shadow-2xl shadow-primary/40 active:scale-95 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Propagating Changes...' : 'Save Architecture Configuration'}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
