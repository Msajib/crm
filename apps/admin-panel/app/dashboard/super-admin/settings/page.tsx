'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';

export default function SuperAdminSettings() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [settings, setSettings] = useState({
    systemName: 'CRM Pro',
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#6366f1',
    secondaryColor: '#4f46e5',
    accentColor: '#f59e0b',
    metaDescription: 'The ultimate CRM for your business',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.get('/tenants/system/settings');
        if (data) {
          setSettings({
            systemName: data.systemName || 'CRM Pro',
            logoUrl: data.logoUrl || '',
            faviconUrl: data.faviconUrl || '',
            primaryColor: data.primaryColor || '#6366f1',
            secondaryColor: data.secondaryColor || '#4f46e5',
            accentColor: data.accentColor || '#f59e0b',
            metaDescription: data.metaDescription || 'The ultimate CRM for your business',
          });
        }
      } catch (error: any) {
        toast.error(`Failed to load system settings: ${error.message}`);
      } finally {
        setFetching(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic frontend validation
    if (!settings.systemName.trim()) {
      return toast.error('System Name cannot be empty');
    }

    setLoading(true);
    try {
      await api.put('/tenants/system/settings', settings);
      toast.success('System settings updated successfully!');
    } catch (error: any) {
      toast.error(`Failed to update settings: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold gradient-text mb-2">System Customization</h1>
          <p className="text-gray-400">Manage global branding and platform-wide configurations.</p>
        </header>

        <form onSubmit={handleSave} className="space-y-8">
          {/* General Settings */}
          <section className="glass-premium p-8 rounded-2xl premium-shadow hover-lift">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <span className="w-2 h-8 bg-indigo-500 rounded-full mr-3"></span>
              General Branding
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">System Name</label>
                <input
                  type="text"
                  value={settings.systemName}
                  onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="e.g. Acme CRM"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Meta Description</label>
                <input
                  type="text"
                  value={settings.metaDescription}
                  onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          </section>

          {/* Visual Assets */}
          <section className="glass-premium p-8 rounded-2xl premium-shadow hover-lift">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <span className="w-2 h-8 bg-purple-500 rounded-full mr-3"></span>
              Visual Assets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-sm text-gray-400">Platform Logo</label>
                <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer group">
                  <div className="w-16 h-16 bg-white/5 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400">Click to upload or drag logo</p>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-sm text-gray-400">Favicon</label>
                <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-purple-500 transition-colors cursor-pointer group">
                  <div className="w-16 h-16 bg-white/5 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400">Click to upload favicon</p>
                </div>
              </div>
            </div>
          </section>

          {/* Theme Colors */}
          <section className="glass-premium p-8 rounded-2xl premium-shadow hover-lift">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <span className="w-2 h-8 bg-pink-500 rounded-full mr-3"></span>
              Platform Theme Colors
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ColorPicker 
                label="Primary Color" 
                value={settings.primaryColor} 
                onChange={(v) => setSettings({...settings, primaryColor: v})} 
              />
              <ColorPicker 
                label="Secondary Color" 
                value={settings.secondaryColor} 
                onChange={(v) => setSettings({...settings, secondaryColor: v})} 
              />
              <ColorPicker 
                label="Accent Color" 
                value={settings.accentColor} 
                onChange={(v) => setSettings({...settings, accentColor: v})} 
              />
            </div>
          </section>

          {/* Pricing Plans */}
          <section className="glass-premium p-8 rounded-2xl premium-shadow hover-lift">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <span className="w-2 h-8 bg-amber-500 rounded-full mr-3"></span>
              Subscription Plans
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: 'Starter', price: '$49', features: '10 Users\nBasic AI Scoring\nEmail Integration\nStandard Analytics' },
                  { name: 'Professional', price: '$149', features: 'Unlimited Users\nAutonomous AI Agent\nFull Automation Wizard\nAdvanced Analytics\nWebhook System' },
                  { name: 'Enterprise', price: 'Custom', features: 'Multi-tenant Deployment\nMCP Protocol Server\nWhite-label Options\n24/7 Priority Support\nCustom Integrations' }
                ].map((tier, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 relative">
                    <input type="text" className="w-full bg-transparent border-b border-white/10 pb-2 mb-4 font-bold text-lg focus:outline-none focus:border-indigo-500" defaultValue={tier.name} />
                    <input type="text" className="w-full bg-transparent border-b border-white/10 pb-2 mb-4 text-sm focus:outline-none focus:border-indigo-500" defaultValue={tier.price} placeholder="Price (e.g. $49)" />
                    <textarea className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 h-40 resize-none" defaultValue={tier.features} placeholder="Features (one per line)"></textarea>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="flex justify-end pt-4">
            <button
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-bold text-white shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed group flex items-center"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {loading ? 'Saving Changes...' : 'Update System Config'}
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

function ColorPicker({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/10">
      <label className="text-sm text-gray-400 block">{label}</label>
      <div className="flex items-center space-x-4">
        <input 
          type="color" 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 rounded-lg bg-transparent border-none cursor-pointer"
        />
        <input 
          type="text" 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent text-sm font-mono focus:outline-none w-20"
        />
      </div>
    </div>
  );
}
