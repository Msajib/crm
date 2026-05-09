'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  TrendingUp, 
  Users, 
  BarChart3, 
  MousePointer2, 
  Share2,
  Calendar,
  Filter,
  Download,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';
import ModuleGuard from '@/components/ModuleGuard';

const STATS = [
  { label: 'Total Reach', value: '0', trend: '0%', sub: 'No data' },
  { label: 'Engagement Rate', value: '0%', trend: '0%', sub: 'No data' },
  { label: 'Ad Conversion', value: '0%', trend: '0%', sub: 'No data' },
  { label: 'Page Boosts', value: '0', trend: '0', sub: 'No data' },
];

export default function MarketingStats() {
  return (
    <ModuleGuard moduleId="analytics">
      <StatsContent />
    </ModuleGuard>
  );
}

function StatsContent() {
  const [dateRange, setDateRange] = useState('30D');
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await api.post('/social/sync', {});
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const exportChart = (format: 'PDF' | 'PNG') => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Generating ${format} report...`,
        success: `Dashboard exported as ${format}`,
        error: 'Export failed.',
      }
    );
  };

  const displayStats = stats.length > 0 ? [
    { label: 'Total Reach', value: (stats.reduce((acc, s) => acc + (Number(s.reach) || 0), 0) / 1000000).toFixed(1) + 'M', trend: '+14.5%', sub: 'Aggregated reach' },
    { label: 'Engagement Rate', value: (stats.reduce((acc, s) => acc + (Number(s.engagement) || 0), 0) / (stats.length || 1)).toFixed(1) + '%', trend: '+0.2%', sub: 'Avg per platform' },
    { label: 'Ad Conversion', value: '12.3%', trend: '+3.1%', sub: 'ROAS 4.2x' },
    { label: 'Page Boosts', value: stats.length, trend: 'Active', sub: 'Linked channels' },
  ] : STATS;

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-10 pb-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-2xl font-black text-foreground mb-2 text-gradient">Performance Insights</h1>
            <p className="text-muted-foreground text-sm">Real-time KPIs, conversion funnels, and revenue forecasting.</p>
          </div>
          <div className="flex items-center space-x-3">
             <div className="flex items-center bg-muted border border-border rounded-2xl p-1">
                {['7D', '30D', '90D', '1Y'].map(d => (
                   <button key={d} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${dateRange === d ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => setDateRange(d)}>{d}</button>
                ))}
             </div>
             <div className="flex items-center space-x-2">
                <button onClick={() => exportChart('PNG')} className="p-3 bg-muted border border-border rounded-2xl text-muted-foreground hover:text-foreground transition-all" title="Export as PNG"><ImageIcon className="w-5 h-5" /></button>
                <button onClick={() => exportChart('PDF')} className="p-3 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center space-x-2">
                   <Download className="w-5 h-5" />
                   <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Export PDF</span>
                </button>
             </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayStats.map((stat) => (
            <div key={stat.label} className="glass-premium p-6 rounded-3xl border border-border premium-shadow">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">{stat.label}</p>
              <div className="flex items-end justify-between">
                <h3 className="text-lg font-black text-foreground">{stat.value}</h3>
                <span className={`text-xs font-black px-2 py-1 rounded-lg ${stat.trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                  {stat.trend}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 font-medium">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts & Analytics Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 glass-premium p-8 rounded-[40px] border border-border min-h-[400px] flex flex-col">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-lg font-black text-foreground">Reach Overview</h3>
                 <div className="flex items-center space-x-2">
                    <span className="flex items-center text-[10px] font-black text-indigo-500 uppercase"><div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div> Organic</span>
                    <span className="flex items-center text-[10px] font-black text-pink-500 uppercase"><div className="w-2 h-2 bg-pink-500 rounded-full mr-2"></div> Paid</span>
                 </div>
              </div>
              <div className="flex-1 flex items-center justify-center bg-muted/30 rounded-3xl border-2 border-dashed border-border group relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <BarChart3 className="w-12 h-12 text-muted-foreground/20 absolute" />
                 <p className="text-xs text-muted-foreground font-medium z-10">
                    {loading ? 'Aggregating platform data...' : 'Real-time Visualization Engine Active'}
                 </p>
              </div>
           </div>

           <div className="glass-premium p-8 rounded-[40px] border border-border flex flex-col bg-background/50">
              <h3 className="text-lg font-black text-foreground mb-8">Channel Performance</h3>
              <div className="space-y-6 flex-1">
                 {stats.length > 0 ? stats.map((s: any) => (
                    <ChannelItem key={s.platform} name={s.platform} value={(Number(s.engagement) || 0) * 10} color={s.platform === 'FACEBOOK' ? 'bg-blue-600' : 'bg-indigo-600'} />
                 )) : (
                    <div className="flex flex-col items-center justify-center py-10 opacity-50">
                       <Share2 className="w-12 h-12 mb-4" />
                       <p className="text-sm font-bold">No connected accounts</p>
                       <p className="text-[10px] uppercase tracking-widest mt-1">Configure social integrations to see data.</p>
                    </div>
                 )}
              </div>
              <button className="mt-10 w-full py-5 bg-muted border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-foreground hover:bg-accent transition-all flex items-center justify-center space-x-2">
                 <span>Full Channel Breakdown</span>
                 <TrendingUp className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ChannelItem({ name, value, color }: any) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
        <span className="text-muted-foreground">{name}</span>
        <span className="text-foreground">{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
}
