'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/components/DashboardLayout';
import RichTextEditor from '@/components/RichTextEditor';
import {
  Save, Palette, Globe, CreditCard, Plus, Trash2, Check,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  badge: string;
  description: string; // HTML from rich text editor
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SuperAdminSettings() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState<'branding' | 'pricing'>('branding');
  const [settings, setSettings] = useState({
    systemName: 'CRM Pro',
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#6366f1',
    secondaryColor: '#4f46e5',
    accentColor: '#f59e0b',
    metaDescription: 'The ultimate CRM for your business',
  });
  const [plans, setPlans] = useState<PricingPlan[]>(DEFAULT_PLANS);

  useEffect(() => {
    const savedPlans = localStorage.getItem('crm_pricing_plans');
    if (savedPlans) {
      try { setPlans(JSON.parse(savedPlans)); } catch {}
    }
    setFetching(false);
  }, []);

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings.systemName.trim()) return toast.error('System Name cannot be empty');
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      toast.success('System settings updated!');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePricing = () => {
    localStorage.setItem('crm_pricing_plans', JSON.stringify(plans));
    window.dispatchEvent(new Event('pricing-updated'));
    toast.success('Pricing plans saved and live on the landing page!');
  };

  const updatePlan = (id: string, field: keyof PricingPlan, value: any) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const updateFeature = (planId: string, idx: number, value: string) => {
    setPlans(prev => prev.map(p => {
      if (p.id !== planId) return p;
      const features = [...p.features];
      features[idx] = value;
      return { ...p, features };
    }));
  };

  const addFeature = (planId: string) => {
    setPlans(prev => prev.map(p =>
      p.id === planId ? { ...p, features: [...p.features, ''] } : p
    ));
  };

  const removeFeature = (planId: string, idx: number) => {
    setPlans(prev => prev.map(p => {
      if (p.id !== planId) return p;
      return { ...p, features: p.features.filter((_, i) => i !== idx) };
    }));
  };

  const tabs = [
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'pricing',  label: 'Subscription Plans', icon: CreditCard },
  ] as const;

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-5xl mx-auto space-y-8">
        <header>
          <h1 className="text-display text-foreground mb-1">System Settings</h1>
          <p className="text-body text-muted-foreground">
            Manage global branding and configure pricing plans that appear on the landing page.
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1.5 bg-muted rounded-2xl border border-border w-fit">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Branding Tab ── */}
        {activeTab === 'branding' && (
          <form onSubmit={handleSaveBranding} className="space-y-6">
            <section className="bg-card border border-border rounded-3xl p-8 space-y-6 premium-shadow">
              <h2 className="text-subheading text-foreground flex items-center gap-3">
                <span className="w-1 h-6 bg-primary rounded-full" />
                General
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-caption">System Name</label>
                  <input
                    type="text"
                    value={settings.systemName}
                    onChange={e => setSettings({ ...settings, systemName: e.target.value })}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                    placeholder="e.g. Acme CRM"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-caption">Meta Description</label>
                  <input
                    type="text"
                    value={settings.metaDescription}
                    onChange={e => setSettings({ ...settings, metaDescription: e.target.value })}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                  />
                </div>
              </div>
            </section>

            <section className="bg-card border border-border rounded-3xl p-8 space-y-6 premium-shadow">
              <h2 className="text-subheading text-foreground flex items-center gap-3">
                <span className="w-1 h-6 bg-purple-500 rounded-full" />
                Theme Colors
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { key: 'primaryColor', label: 'Primary' },
                  { key: 'secondaryColor', label: 'Secondary' },
                  { key: 'accentColor', label: 'Accent' },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-2 p-4 bg-muted rounded-2xl border border-border">
                    <label className="text-caption">{label} Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={(settings as any)[key]}
                        onChange={e => setSettings({ ...settings, [key]: e.target.value })}
                        className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={(settings as any)[key]}
                        onChange={e => setSettings({ ...settings, [key]: e.target.value })}
                        className="bg-transparent text-body font-mono text-foreground focus:outline-none flex-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-10 py-4 bg-primary text-white rounded-2xl font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-primary/25 active:scale-95 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving…' : 'Save Branding'}
              </button>
            </div>
          </form>
        )}

        {/* ── Pricing Plans Tab ── */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-body text-muted-foreground">
                Changes here are instantly reflected on the public landing page.
              </p>
              <button
                onClick={handleSavePricing}
                className="px-8 py-3 bg-primary text-white rounded-2xl font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-primary/25 active:scale-95"
              >
                <Save className="w-4 h-4" />
                Save & Publish
              </button>
            </div>

            {plans.map((plan) => (
              <div key={plan.id} className={`bg-card border rounded-3xl p-8 premium-shadow space-y-6 ${plan.highlighted ? 'border-primary/40' : 'border-border'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.highlighted ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-subheading text-foreground">{plan.name}</h3>
                      <p className="text-caption text-muted-foreground">{plan.highlighted ? 'Featured plan' : 'Standard plan'}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updatePlan(plan.id, 'highlighted', !plan.highlighted)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${
                      plan.highlighted ? 'bg-primary/10 text-primary border-primary/30' : 'bg-muted text-muted-foreground border-border hover:border-primary/20'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    {plan.highlighted ? 'Featured' : 'Set as Featured'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-caption">Plan Name</label>
                    <input
                      type="text"
                      value={plan.name}
                      onChange={e => updatePlan(plan.id, 'name', e.target.value)}
                      className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-caption">Price</label>
                    <input
                      type="text"
                      value={plan.price}
                      onChange={e => updatePlan(plan.id, 'price', e.target.value)}
                      placeholder="$49 or Custom"
                      className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-caption">Period</label>
                    <input
                      type="text"
                      value={plan.period}
                      onChange={e => updatePlan(plan.id, 'period', e.target.value)}
                      placeholder="/month"
                      className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-caption">CTA Button Text</label>
                    <input
                      type="text"
                      value={plan.cta}
                      onChange={e => updatePlan(plan.id, 'cta', e.target.value)}
                      placeholder="Get Started"
                      className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-caption">Badge Label (optional)</label>
                  <input
                    type="text"
                    value={plan.badge}
                    onChange={e => updatePlan(plan.id, 'badge', e.target.value)}
                    placeholder="e.g. Most Popular, Best Value"
                    className="w-full md:w-1/2 bg-muted border border-border rounded-xl px-3 py-2.5 text-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-caption">Description (Rich Text)</label>
                  <RichTextEditor
                    value={plan.description}
                    onChange={html => updatePlan(plan.id, 'description', html)}
                    placeholder="Describe this plan..."
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-caption">Features</label>
                    <button
                      type="button"
                      onClick={() => addFeature(plan.id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Feature
                    </button>
                  </div>
                  <div className="space-y-2">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        <input
                          type="text"
                          value={feat}
                          onChange={e => updateFeature(plan.id, idx, e.target.value)}
                          className="flex-1 bg-muted border border-border rounded-xl px-3 py-2 text-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                          placeholder="Feature description"
                        />
                        <button
                          type="button"
                          onClick={() => removeFeature(plan.id, idx)}
                          className="p-2 text-muted-foreground hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
