'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'react-hot-toast';
import { LayoutGrid, Check, Save, Info } from 'lucide-react';

const STAT_OPTIONS = [
  {
    id: 'Revenue',
    label: 'Won Revenue',
    desc: 'Total value of successfully closed deals.',
    group: 'Sales',
  },
  {
    id: 'Deals',
    label: 'Active Deals',
    desc: 'Open opportunities currently in the pipeline.',
    group: 'Sales',
  },
  {
    id: 'ConversionRate',
    label: 'Conversion Rate',
    desc: 'Percentage of deals successfully won vs. total.',
    group: 'Sales',
  },
  {
    id: 'Contacts',
    label: 'Total Contacts',
    desc: 'Size of your customer and lead database.',
    group: 'CRM',
  },
  {
    id: 'Tasks',
    label: 'Open Tasks',
    desc: 'Pending tasks that require attention.',
    group: 'Productivity',
  },
  {
    id: 'TasksCompleted',
    label: 'Completed Tasks',
    desc: 'Tasks your team has finished.',
    group: 'Productivity',
  },
  {
    id: 'OverdueTasks',
    label: 'Overdue Tasks',
    desc: 'Tasks that passed their due date without completion.',
    group: 'Productivity',
  },
  {
    id: 'Calls',
    label: 'Calls Logged',
    desc: 'Total phone calls recorded as activities.',
    group: 'Communication',
  },
  {
    id: 'Emails',
    label: 'Emails Sent',
    desc: 'Total emails recorded as activities.',
    group: 'Communication',
  },
  {
    id: 'Messages',
    label: 'Messages Sent',
    desc: 'SMS & WhatsApp messages recorded as activities.',
    group: 'Communication',
  },
  {
    id: 'RevenueChart',
    label: 'Revenue Analytics Chart',
    desc: 'Show the full revenue trend chart panel on the dashboard.',
    group: 'Panels',
  },
  {
    id: 'AIInsights',
    label: 'AI Lead Insights',
    desc: 'Show the AI-powered lead score sidebar panel.',
    group: 'Panels',
  },
  {
    id: 'Campaigns',
    label: 'Campaign Monitoring',
    desc: 'Show real-time progress bars for active marketing campaigns.',
    group: 'Panels',
  },
];

const DEFAULT_PREFS = ['Revenue', 'Deals', 'Contacts', 'Tasks', 'RevenueChart', 'AIInsights'];
const GROUPS = ['Sales', 'CRM', 'Productivity', 'Communication', 'Panels'];

export default function DashboardSettings() {
  const [preferences, setPreferences] = useState<string[]>(DEFAULT_PREFS);

  useEffect(() => {
    const savedPrefs = localStorage.getItem('dashboard_stats_prefs');
    if (savedPrefs) setPreferences(JSON.parse(savedPrefs));
  }, []);

  const togglePref = (id: string) => {
    setPreferences(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    localStorage.setItem('dashboard_stats_prefs', JSON.stringify(preferences));
    toast.success('Dashboard preferences saved!');
    window.dispatchEvent(new Event('dashboard-prefs-updated'));
  };

  const handleSelectAll = () => setPreferences(STAT_OPTIONS.map(o => o.id));
  const handleClearAll = () => setPreferences([]);

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-5xl mx-auto space-y-8">
        <header>
          <h1 className="text-display text-foreground mb-2">Dashboard Configuration</h1>
          <p className="text-body text-muted-foreground">
            Personalize your overview. Select which metrics and panels appear on your dashboard.
          </p>
        </header>

        <div className="flex items-center justify-between">
          <p className="text-caption">{preferences.length} of {STAT_OPTIONS.length} selected</p>
          <div className="flex gap-3">
            <button onClick={handleClearAll} className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground border border-border rounded-xl transition-all hover:bg-muted">
              Clear All
            </button>
            <button onClick={handleSelectAll} className="px-4 py-2 text-xs font-bold text-primary border border-primary/30 rounded-xl transition-all hover:bg-primary/10">
              Select All
            </button>
          </div>
        </div>

        {GROUPS.map(group => {
          const opts = STAT_OPTIONS.filter(o => o.group === group);
          return (
            <section key={group} className="bg-card border border-border rounded-3xl p-8 space-y-4 premium-shadow">
              <h2 className="text-subheading text-foreground flex items-center gap-3">
                <span className="w-1.5 h-5 bg-primary rounded-full" />
                {group}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {opts.map((opt) => {
                  const active = preferences.includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      onClick={() => togglePref(opt.id)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 group ${
                        active
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-card hover:border-primary/30'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="text-body font-semibold text-foreground">{opt.label}</h4>
                        <p className="text-caption mt-0.5 leading-snug">{opt.desc}</p>
                      </div>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                        active ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-muted text-transparent'
                      }`}>
                        <Check className="w-4 h-4" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-start gap-3">
          <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-caption leading-relaxed text-muted-foreground">
            <span className="font-bold text-foreground">Note: </span>
            Settings are stored per-user in the browser. They do not affect other team members' views.
          </p>
        </div>

        <div className="flex justify-end pb-4">
          <button
            onClick={handleSave}
            className="px-10 py-4 bg-primary text-white rounded-2xl font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-primary/25 active:scale-95"
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
