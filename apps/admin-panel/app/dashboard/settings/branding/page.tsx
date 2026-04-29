'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';

export default function TenantBrandingSettings() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    name: 'My Awesome Company',
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#6366f1',
    secondaryColor: '#4f46e5',
    accentColor: '#f59e0b',
  });

  useEffect(() => {
    const fetchCurrentTenant = async () => {
      try {
        const data = await api.get('/tenants/current');
        if (data) {
          setTenantId(data.id);
          setSettings({
            name: data.name || 'My Awesome Company',
            logoUrl: data.logoUrl || '',
            faviconUrl: data.faviconUrl || '',
            primaryColor: data.primaryColor || '#6366f1',
            secondaryColor: data.secondaryColor || '#4f46e5',
            accentColor: data.accentColor || '#f59e0b',
          });
        }
      } catch (error: any) {
        toast.error(`Failed to load branding: ${error.message}`);
      } finally {
        setFetching(false);
      }
    };
    fetchCurrentTenant();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return toast.error('Tenant ID not found. Please refresh.');
    if (!settings.name.trim()) return toast.error('Workspace Name is required');

    setLoading(true);
    try {
      await api.patch(`/tenants/${tenantId}/branding`, {
        name: settings.name,
        logoUrl: settings.logoUrl,
        faviconUrl: settings.faviconUrl,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        accentColor: settings.accentColor,
      });
      toast.success('Workspace branding updated!');
    } catch (error: any) {
      toast.error(`Update failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <header className="mb-10">
          <div className="flex items-center space-x-3 mb-4">
             <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">Workspace Branding</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Personalize Your CRM</h1>
          <p className="text-muted-foreground text-sm">Custom logo, colors, and identity for your team and clients.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSave} className="space-y-6">
              <section className="glass-premium border border-border rounded-3xl p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Workspace Name</label>
                    <input
                      type="text"
                      value={settings.name}
                      onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                      className="w-full bg-background border border-border rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-lg text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ColorBox label="Primary" color={settings.primaryColor} onChange={(c) => setSettings({...settings, primaryColor: c})} />
                    <ColorBox label="Secondary" color={settings.secondaryColor} onChange={(c) => setSettings({...settings, secondaryColor: c})} />
                    <ColorBox label="Accent" color={settings.accentColor} onChange={(c) => setSettings({...settings, accentColor: c})} />
                  </div>
                </div>
              </section>

              <section className="glass-premium border border-border rounded-3xl p-8">
                 <h3 className="text-lg font-semibold mb-6 text-foreground">Logo & Favicon</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group relative bg-muted/50 border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-all cursor-pointer">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <span className="text-sm text-muted-foreground">Upload Main Logo</span>
                    </div>
                    <div className="group relative bg-muted/50 border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-all cursor-pointer">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                        </div>
                        <span className="text-sm text-muted-foreground">Upload Favicon</span>
                    </div>
                 </div>
              </section>

              <button
                disabled={loading}
                className="w-full py-5 bg-primary text-primary-foreground rounded-3xl font-bold text-lg hover:bg-primary/90 transition-all flex items-center justify-center space-x-2"
              >
                {loading ? 'Processing...' : 'Save Branding Changes'}
              </button>
            </form>
          </div>

          <aside className="space-y-6">
            <div className="glass-premium border border-border rounded-3xl p-6 sticky top-8">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6 flex items-center">
                   <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                   Live Identity Preview
                </h3>
                <div className="rounded-2xl overflow-hidden bg-background border border-border shadow-2xl scale-95 origin-top transition-all duration-500">
                    <div className="h-10 border-b border-border bg-muted/50 flex items-center px-4 justify-between">
                        <div className="flex space-x-1.5">
                           <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40"></div>
                           <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40"></div>
                           <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40"></div>
                        </div>
                        <div className="px-3 py-1 bg-background/50 rounded-md text-[8px] text-muted-foreground font-mono">crm-pro.internal</div>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-300" style={{ backgroundColor: settings.primaryColor }}>
                               {settings.logoUrl ? (
                                  <img src={settings.logoUrl} alt="Logo" className="w-6 h-6 object-contain" />
                               ) : (
                                  <span className="text-white font-black text-xs">{settings.name.charAt(0)}</span>
                               )}
                            </div>
                             <div>
                               <div className="h-4 w-32 bg-muted rounded mb-1.5"></div>
                               <p className="text-[10px] font-bold text-muted-foreground truncate max-w-[120px]">{settings.name}</p>
                             </div>
                        </div>
                         <div className="space-y-3">
                            <div className="h-3 w-full bg-muted rounded"></div>
                            <div className="h-3 w-5/6 bg-muted rounded"></div>
                            <div className="h-3 w-4/6 bg-muted rounded"></div>
                        </div>
                         <div className="grid grid-cols-2 gap-3 mt-4">
                           <div className="h-12 rounded-xl bg-muted border border-border flex items-center justify-center">
                              <div className="h-2 w-12 bg-muted-foreground/20 rounded"></div>
                           </div>
                           <div className="h-12 rounded-xl shadow-lg flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: settings.primaryColor }}>
                              <div className="h-2 w-12 bg-white/20 rounded"></div>
                           </div>
                        </div>
                    </div>
                </div>
                 <div className="mt-6 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                   <p className="text-[10px] text-primary font-medium leading-relaxed">
                      <span className="font-bold">Pro Tip:</span> This preview uses your selected hex codes in real-time. Changes are applied globally once saved.
                   </p>
                </div>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ColorBox({ label, color, onChange }: { label: string, color: string, onChange: (c: string) => void }) {
    return (
        <div className="p-4 bg-muted/50 border border-border rounded-2xl">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">{label}</p>
            <div className="flex items-center space-x-3">
                <input 
                    type="color" 
                    value={color} 
                    onChange={(e) => onChange(e.target.value)}
                    className="w-8 h-8 bg-transparent border-none rounded cursor-pointer"
                />
                <span className="text-xs font-mono text-foreground">{color}</span>
            </div>
        </div>
    )
}
