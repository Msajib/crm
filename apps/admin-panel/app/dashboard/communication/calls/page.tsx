'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Phone, 
  PhoneCall, 
  PhoneForwarded, 
  PhoneIncoming, 
  PhoneMissed,
  Search,
  MoreVertical,
  Play,
  Clock,
  RotateCcw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CommunicationCalls() {
  const [calls, setCalls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialing, setDialing] = useState(false);

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/communications/logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCalls(data.calls || []);
      }
    } catch (err) {
      toast.error('Failed to fetch call logs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCall = () => {
    setDialing(true);
    toast.loading('Initializing secure VoIP connection...', { duration: 3000 });
    setTimeout(() => {
      setDialing(false);
      toast.error('Voice service not active. Please connect Twilio API.');
    }, 3000);
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-10">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-foreground mb-2">Voice & Dialer</h1>
            <p className="text-muted-foreground">Manage business calls and review voice recording transcripts.</p>
          </div>
          <button 
            onClick={handleCall}
            className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black flex items-center space-x-3 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/25 active:scale-95"
          >
            <PhoneCall className="w-5 h-5" />
            <span>Open Dialer</span>
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Dialer/Stats Aside */}
           <aside className="space-y-6">
              <div className="bg-card p-8 rounded-[40px] border border-border bg-emerald-500/5">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold text-foreground">Active Line</h3>
                    <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                 </div>
                 <p className="text-2xl font-black text-foreground mb-1">+1 (888) CRM-PROS</p>
                 <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mb-8">System Primary Number</p>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background rounded-2xl p-4 border border-border">
                       <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Mins Used</p>
                       <p className="text-lg font-black text-foreground">1,240</p>
                    </div>
                    <div className="bg-background rounded-2xl p-4 border border-border">
                       <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Total Calls</p>
                       <p className="text-lg font-black text-foreground">{calls.length}</p>
                    </div>
                 </div>
              </div>
           </aside>

           {/* Call Logs Table */}
           <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-4 px-2">
                 <h2 className="text-lg font-bold text-foreground flex items-center">
                    <Clock className="w-5 h-5 mr-3 text-primary" />
                    Recent Activity
                 </h2>
                 <div className="flex items-center space-x-3">
                    <button onClick={fetchCalls} className="p-2 hover:bg-muted rounded-xl transition-all"><RotateCcw className="w-4 h-4 text-muted-foreground" /></button>
                    <div className="relative">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                       <input type="text" placeholder="Search logs..." className="bg-muted border border-border rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                 </div>
              </div>

              <div className="space-y-3">
                 {isLoading ? (
                    <div className="p-10 text-center bg-card rounded-[40px] border border-border">
                       <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                       <p className="text-sm text-muted-foreground">Loading voice records...</p>
                    </div>
                 ) : calls.length === 0 ? (
                    <div className="p-20 text-center bg-card rounded-[40px] border border-border">
                       <Phone className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                       <p className="text-sm text-muted-foreground">No recent calls found</p>
                    </div>
                 ) : calls.map((call) => (
                    <div key={call.id} className="bg-card p-4 rounded-3xl border border-border flex items-center justify-between group hover:border-primary/20 transition-all">
                       <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                             call.status === 'MISSED' ? 'bg-red-500/10 text-red-500' :
                             call.status === 'BUSY' ? 'bg-amber-500/10 text-amber-500' :
                             'bg-emerald-500/10 text-emerald-500'
                          }`}>
                             {call.status === 'COMPLETED' ? <PhoneIncoming className="w-4 h-4" /> :
                              <PhoneMissed className="w-4 h-4" />}
                          </div>
                          <div>
                             <p className="text-sm font-bold text-foreground">{call.to}</p>
                             <p className="text-[10px] text-muted-foreground">{new Date(call.createdAt).toLocaleString()}</p>
                          </div>
                       </div>
                       
                       <div className="flex items-center space-x-4">
                          <div className="text-right mr-4 hidden md:block">
                             <p className="text-xs font-bold text-foreground">{Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}</p>
                             <p className="text-[9px] text-gray-500 uppercase font-black">Duration</p>
                          </div>
                          <button className="p-2 bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-all">
                             <Play className="w-4 h-4" />
                          </button>
                          <button className="p-2 bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-all">
                             <MoreVertical className="w-4 h-4" />
                          </button>
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
