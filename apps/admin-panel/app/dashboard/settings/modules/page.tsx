'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'react-hot-toast';
import { LayoutGrid, Save, Lock } from 'lucide-react';

const ALL_MODULES = [
  { id: 'tasks', name: 'Tasks Module', desc: 'Task management and boards.' },
  { id: 'deals', name: 'Deals & Pipeline', desc: 'Sales pipeline and forecasting.' },
  { id: 'marketing', name: 'Marketing Hub', desc: 'Social connect and analytics.' },
  { id: 'communication', name: 'Communication', desc: 'Calls, emails, and messages.' },
];

export default function TenantModulesSettings() {
  const [loading, setLoading] = useState(false);
  const [enabledModules, setEnabledModules] = useState<string[]>(ALL_MODULES.map(m => m.id));
  const [globalDisabled, setGlobalDisabled] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tenant_disabled_modules');
      if (saved) {
        const disabledIds = JSON.parse(saved);
        setEnabledModules(ALL_MODULES.map(m => m.id).filter(id => !disabledIds.includes(id)));
      }
      const globalStr = localStorage.getItem('global_disabled_modules');
      if (globalStr) {
        setGlobalDisabled(JSON.parse(globalStr));
      }
    }
  }, []);

  const handleToggle = (id: string) => {
    if (globalDisabled.includes(id)) return; // Cannot toggle globally disabled
    setEnabledModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const disabledIds = ALL_MODULES.map(m => m.id).filter(id => !enabledModules.includes(id) && !globalDisabled.includes(id));
      localStorage.setItem('tenant_disabled_modules', JSON.stringify(disabledIds));
      toast.success('Module preferences updated! Refreshing sidebar...', { duration: 2000 });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error('Failed to update modules');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-4xl mx-auto space-y-10">
        <header>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center">
            <LayoutGrid className="w-8 h-8 mr-3 text-primary" />
            Workspace Modules
          </h1>
          <p className="text-muted-foreground text-sm">Enable or disable specific features for your workspace. Disabled modules will be hidden from the sidebar.</p>
        </header>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ALL_MODULES.map(module => {
              const isGloballyDisabled = globalDisabled.includes(module.id);
              const isEnabled = enabledModules.includes(module.id) && !isGloballyDisabled;

              return (
                <div key={module.id} className={`glass-premium p-6 rounded-3xl border ${isEnabled ? 'border-primary/50 bg-primary/5' : 'border-border'} transition-all`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground flex items-center">
                        {module.name}
                        {isGloballyDisabled && <Lock className="w-4 h-4 ml-2 text-red-500" title="Disabled by Super Admin" />}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">{module.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={isEnabled} 
                        onChange={() => handleToggle(module.id)}
                        disabled={isGloballyDisabled}
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary opacity-90 disabled:opacity-50"></div>
                    </label>
                  </div>
                  {isGloballyDisabled && (
                    <p className="text-[10px] text-red-500 font-bold uppercase">Disabled globally by System Administrator</p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              disabled={loading}
              className="px-10 py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold flex items-center space-x-2 transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Saving...' : 'Save Module Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
