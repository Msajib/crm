'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { TrendingUp, Users, Briefcase, CheckCircle2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    setUser({ email: 'admin@crm.local' });
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-10 animate-fade-in">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Revenue" 
            value="$128,430" 
            trend="+12.5%" 
            icon={TrendingUp} 
            color="indigo" 
          />
          <StatCard 
            title="Active Deals" 
            value="42" 
            trend="+5.2%" 
            icon={Briefcase} 
            color="emerald" 
          />
          <StatCard 
            title="Total Contacts" 
            value="2,845" 
            trend="+18.4%" 
            icon={Users} 
            color="purple" 
          />
          <StatCard 
            title="Tasks Completed" 
            value="156" 
            trend="+2.1%" 
            icon={CheckCircle2} 
            color="orange" 
          />
        </div>

        {/* Charts & Table Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass-premium rounded-3xl p-8 premium-shadow min-h-[450px]">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-white">Revenue Analytics</h3>
              <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs focus:outline-none">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-64 w-full flex items-center justify-center border-2 border-dashed border-white/5 rounded-2xl">
              <p className="text-gray-600 text-sm italic">Analytics Visualization Pipeline...</p>
            </div>
          </div>

          <div className="glass-premium rounded-3xl p-8 premium-shadow">
            <h3 className="text-xl font-bold text-white mb-6">Recent Activities</h3>
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300 font-medium">New contact added</p>
                    <p className="text-xs text-gray-500">Sarah Jenkins • 2h ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, trend, icon: Icon, color }: any) {
  const colorMap: any = {
    indigo: 'text-indigo-400 bg-indigo-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
    orange: 'text-orange-400 bg-orange-500/10',
  };

  return (
    <div className="glass-premium p-6 rounded-3xl premium-shadow hover-lift group border border-white/5">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex items-center space-x-1 text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full text-[10px] font-bold">
          <ArrowUpRight className="w-3 h-3" />
          <span>{trend}</span>
        </div>
      </div>
      <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
      <h4 className="text-2xl font-black text-white">{value}</h4>
    </div>
  );
}
