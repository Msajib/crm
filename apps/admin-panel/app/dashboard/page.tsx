'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import {
  TrendingUp, Users, Briefcase, CheckCircle2, ArrowUpRight,
  BarChart3, Sparkles, Phone, Mail, MessageSquare,
  ClipboardList, AlertCircle, CheckSquare2, RefreshCw, Zap
} from 'lucide-react';

const DEFAULT_PREFS = ['Revenue', 'Deals', 'Contacts', 'Tasks', 'RevenueChart', 'AIInsights'];

interface Stats {
  contacts: { total: number };
  deals: { open: number; won: number; lost: number; total: number; conversionRate: string; wonValue: number; totalValue: number };
  tasks: { total: number; open: number; completed: number; overdue: number };
  activities: { calls: number; emails: number; messages: number };
}

interface StatCardDef {
  id: string;
  title: string;
  getValue: (s: Stats) => string | number;
  icon: any;
  color: 'indigo' | 'emerald' | 'purple' | 'orange' | 'rose' | 'sky' | 'amber' | 'teal' | 'pink' | 'cyan';
}

const STAT_CARDS: StatCardDef[] = [
  { id: 'Revenue', title: 'Won Revenue', getValue: s => `$${(s.deals?.wonValue || 0).toLocaleString()}`, icon: TrendingUp, color: 'indigo' },
  { id: 'Deals', title: 'Active Deals', getValue: s => s.deals?.open ?? 0, icon: Briefcase, color: 'emerald' },
  { id: 'ConversionRate', title: 'Conversion Rate', getValue: s => `${s.deals?.conversionRate ?? '0'}%`, icon: CheckCircle2, color: 'purple' },
  { id: 'Contacts', title: 'Total Contacts', getValue: s => s.contacts?.total ?? 0, icon: Users, color: 'orange' },
  { id: 'Tasks', title: 'Open Tasks', getValue: s => s.tasks?.open ?? 0, icon: ClipboardList, color: 'sky' },
  { id: 'TasksCompleted', title: 'Completed Tasks', getValue: s => s.tasks?.completed ?? 0, icon: CheckSquare2, color: 'teal' },
  { id: 'OverdueTasks', title: 'Overdue Tasks', getValue: s => s.tasks?.overdue ?? 0, icon: AlertCircle, color: 'rose' },
  { id: 'Calls', title: 'Calls Logged', getValue: s => s.activities?.calls ?? 0, icon: Phone, color: 'amber' },
  { id: 'Emails', title: 'Emails Sent', getValue: s => s.activities?.emails ?? 0, icon: Mail, color: 'pink' },
  { id: 'Messages', title: 'Messages Sent', getValue: s => s.activities?.messages ?? 0, icon: MessageSquare, color: 'cyan' },
];

const colorMap: Record<string, { bg: string; icon: string; badge: string }> = {
  indigo: { bg: 'bg-indigo-500/10', icon: 'text-indigo-500', badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
  emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-500', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  purple: { bg: 'bg-purple-500/10', icon: 'text-purple-500', badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  orange: { bg: 'bg-orange-500/10', icon: 'text-orange-500', badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  rose: { bg: 'bg-rose-500/10', icon: 'text-rose-500', badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  sky: { bg: 'bg-sky-500/10', icon: 'text-sky-500', badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' },
  amber: { bg: 'bg-amber-500/10', icon: 'text-amber-500', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  teal: { bg: 'bg-teal-500/10', icon: 'text-teal-500', badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400' },
  pink: { bg: 'bg-pink-500/10', icon: 'text-pink-500', badge: 'bg-pink-500/10 text-pink-600 dark:text-pink-400' },
  cyan: { bg: 'bg-cyan-500/10', icon: 'text-cyan-500', badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [preferences, setPreferences] = useState<string[]>(DEFAULT_PREFS);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);

  const loadPrefs = () => {
    const saved = localStorage.getItem('dashboard_stats_prefs');
    if (saved) setPreferences(JSON.parse(saved));
  };

  const fetchStats = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const [statsRes, insightsRes, campRes] = await Promise.all([
        api.get('/analytics/dashboard').catch(err => {
          console.warn('Dashboard stats fetch failed', err);
          return null;
        }),
        api.get('/ai/lead-scores').catch(err => {
          console.warn('AI lead scores fetch failed', err);
          return [];
        }),
        api.get('/marketing/campaigns').catch(err => {
          console.warn('Campaigns fetch failed', err);
          return [];
        }),
      ]);
      setStats(statsRes);
      setAiInsights(Array.isArray(insightsRes) ? insightsRes : []);
      const campArray = Array.isArray(campRes) ? campRes : [];
      setActiveCampaigns(campArray.filter((c: any) => c.status === 'RUNNING'));
    } catch (e) {
      console.error('Dashboard primary fetch error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPrefs();
    fetchStats();
    const interval = setInterval(() => fetchStats(false), 30000); // Background poll
    const handler = () => { loadPrefs(); };
    window.addEventListener('dashboard-prefs-updated', handler);
    return () => {
      window.removeEventListener('dashboard-prefs-updated', handler);
      clearInterval(interval);
    };
  }, []);

  const activeCards = STAT_CARDS.filter(c => preferences.includes(c.id));
  const showRevenueChart = preferences.includes('RevenueChart');
  const showAIInsights = preferences.includes('AIInsights');
  const showCampaigns = preferences.includes('Campaigns');

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh] flex-col gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-caption text-muted-foreground animate-pulse">Loading dashboard…</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-display text-foreground">Overview</h1>
            <p className="text-caption text-muted-foreground mt-1">
              Live data from your CRM workspace
            </p>
          </div>
          <button
            onClick={() => fetchStats(true)}
            className={`flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-xl text-caption text-muted-foreground hover:text-foreground hover:bg-accent transition-all ${refreshing ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Active Campaigns Widget */}
        {showCampaigns && activeCampaigns.length > 0 && (
          <section className="mb-12 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></div>
              <h2 className="text-xl font-black text-foreground tracking-tight uppercase tracking-[0.2em]">Running Campaigns</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeCampaigns.map(camp => (
                <div key={camp.id} className="glass-premium p-6 rounded-[32px] border border-amber-500/20 shadow-xl shadow-amber-500/5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-black text-foreground">{camp.name}</h3>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{camp.processedCount} / {camp.leadIds?.length || 0} Leads Sent</p>
                    </div>
                    <Zap className="w-5 h-5 text-amber-500 fill-current" />
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden border border-border mb-2">
                    <div
                      className="h-full bg-amber-500 shadow-lg shadow-amber-500/30 transition-all duration-1000"
                      style={{ width: `${Math.max(0, Math.min(100, (camp.processedCount / (camp.leadIds?.length || 1)) * 100)) || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-right text-muted-foreground font-black italic">
                    {Math.round((camp.processedCount / (camp.leadIds?.length || 1)) * 100)}% Complete
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Stats Grid */}
        {activeCards.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeCards.map(card => {
              const c = colorMap[card.color];
              const Icon = card.icon;
              return (
                <div key={card.id} className="glass-premium p-5 rounded-2xl premium-shadow hover:scale-[1.02] transition-transform group border border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2.5 rounded-xl ${c.bg}`}>
                      <Icon className={`w-5 h-5 ${c.icon}`} />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.badge}`}>
                      LIVE
                    </span>
                  </div>
                  <p className="text-caption text-muted-foreground mb-1">{card.title}</p>
                  <h4 className="text-2xl font-black text-foreground tabular-nums">
                    {stats ? String(card.getValue(stats)) : '—'}
                  </h4>
                </div>
              );
            })}
          </div>
        )}

        {activeCards.length === 0 && (
          <div className="glass-premium rounded-2xl p-16 text-center border border-dashed border-border">
            <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-body text-muted-foreground">No stats selected.</p>
            <a href="/dashboard/settings/dashboard" className="text-sm font-bold text-primary hover:underline mt-2 inline-block">
              Configure Dashboard →
            </a>
          </div>
        )}

        {/* Main Panels */}
        {(showRevenueChart || showAIInsights) && (
          <div className={`grid gap-6 ${showRevenueChart && showAIInsights ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>

            {/* Revenue Analytics Panel */}
            {showRevenueChart && (
              <div className={`glass-premium rounded-3xl p-8 premium-shadow border border-border ${showAIInsights ? 'lg:col-span-2' : ''}`}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-subheading text-foreground">Revenue Analytics</h3>
                    <p className="text-caption text-muted-foreground mt-0.5">Won vs. Total pipeline value</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-primary rounded-full" />
                      <span className="text-caption text-muted-foreground">Won</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-border rounded-full" />
                      <span className="text-caption text-muted-foreground">Pipeline</span>
                    </div>
                  </div>
                </div>

                {/* Deal Funnel Visual */}
                <div className="space-y-4 mb-6">
                  {[
                    { label: 'Total Pipeline', value: stats?.deals?.totalValue || 0, color: 'bg-muted', max: Math.max(stats?.deals?.totalValue || 1, 1) },
                    { label: 'Won Revenue', value: stats?.deals?.wonValue || 0, color: 'bg-primary', max: Math.max(stats?.deals?.totalValue || 1, 1) },
                  ].map(row => {
                    const pct = row.max > 0 ? Math.round((row.value / row.max) * 100) : 0;
                    return (
                      <div key={row.label}>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-caption text-muted-foreground">{row.label}</span>
                          <span className="text-caption font-bold text-foreground">${row.value.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${row.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Deal Status Summary */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
                  {[
                    { label: 'Open', value: stats?.deals?.open ?? 0, color: 'text-sky-500' },
                    { label: 'Won', value: stats?.deals?.won ?? 0, color: 'text-emerald-500' },
                    { label: 'Lost', value: stats?.deals?.lost ?? 0, color: 'text-rose-500' },
                  ].map(d => (
                    <div key={d.label} className="text-center">
                      <p className={`text-xl font-black tabular-nums ${d.color}`}>{d.value}</p>
                      <p className="text-caption text-muted-foreground">{d.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Insights Panel */}
            {showAIInsights && (
              <div className="glass-premium rounded-3xl p-8 premium-shadow border border-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-subheading text-foreground">AI Lead Insights</h3>
                    <p className="text-caption text-muted-foreground">Powered by AI Sales Agent</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {aiInsights.length > 0 ? (
                    aiInsights.slice(0, 5).map((insight: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black ${insight.score >= 80 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : insight.score >= 50 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}>
                          {insight.score}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-body text-foreground font-semibold truncate">{insight.name}</p>
                          <p className="text-caption text-muted-foreground">Lead score</p>
                        </div>
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden flex-shrink-0">
                          <div
                            className={`h-full rounded-full ${insight.score >= 80 ? 'bg-emerald-500' : insight.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${insight.score}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Sparkles className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-body text-muted-foreground">No lead scores yet.</p>
                      <p className="text-caption text-muted-foreground mt-1">Add contacts to generate AI insights.</p>
                    </div>
                  )}
                </div>

                {aiInsights.length > 0 && (
                  <a href="/dashboard/ai" className="mt-6 block text-center text-xs font-bold text-primary hover:underline">
                    View Full AI Analysis →
                  </a>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
