'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Webhook, 
  Plus, 
  Activity, 
  Terminal, 
  RefreshCw, 
  Search, 
  X,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Database
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ActionDropdown from '@/components/ActionDropdown';
import ModuleGuard from '@/components/ModuleGuard';

const MOCK_WEBHOOKS = [
  { id: 1, name: 'Stripe Payment Webhook', url: 'https://api.crm.com/webhooks/stripe', status: 'ACTIVE', lastEvent: 'Success', time: '5 mins ago' },
  { id: 2, name: 'Lead Form Submissions', url: 'https://api.crm.com/webhooks/landing-page', status: 'ACTIVE', lastEvent: 'Success', time: '1 hour ago' },
  { id: 3, name: 'Zendesk Ticket Sync', url: 'https://api.crm.com/webhooks/zendesk', status: 'FAILED', lastEvent: '404 Error', time: '12 mins ago' },
];

export default function WebhookSystemPage() {
  return (
    <ModuleGuard moduleId="webhooks">
      <WebhooksContent />
    </ModuleGuard>
  );
}

function WebhooksContent() {
  const [webhooks, setWebhooks] = useState(MOCK_WEBHOOKS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [inspectPayload, setInspectPayload] = useState<any>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newHook = {
      id: Date.now(),
      name: formData.get('name') as string,
      url: formData.get('url') as string,
      status: 'ACTIVE',
      lastEvent: 'None',
      time: 'Just now'
    };
    setWebhooks([newHook, ...webhooks]);
    setShowAddModal(false);
    toast.success('Webhook created successfully!');
  };

  const handleTest = (id: number) => {
    toast.loading('Testing webhook...', { duration: 1500 });
    setTimeout(() => {
      toast.success('Event delivered successfully!');
    }, 1500);
  };

  const handleDelete = (id: number) => {
    if (confirm('Delete this webhook?')) {
      setWebhooks(webhooks.filter(w => w.id !== id));
      toast.success('Webhook deleted');
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-10 pb-20">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-foreground mb-2 text-gradient flex items-center">
              <Webhook className="w-8 h-8 mr-3 text-primary" />
              Webhook System
            </h1>
            <p className="text-muted-foreground text-sm">Manage inbound and outbound webhooks with automatic retry logic and full payload inspection.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-white px-8 py-4 rounded-2xl font-black flex items-center space-x-3 hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Add Webhook</span>
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Webhook List */}
           <div className="lg:col-span-2 space-y-6">
              {webhooks.map(hook => (
                 <div key={hook.id} className="glass-premium p-8 rounded-[40px] border border-border flex flex-col space-y-6 group hover:border-primary/20 transition-all premium-shadow bg-background/50">
                    <div className="flex justify-between items-start">
                       <div className="flex items-center space-x-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                             hook.status === 'ACTIVE' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-red-500/10 text-red-500'
                          }`}>
                             <Activity className="w-6 h-6" />
                          </div>
                          <div>
                             <h3 className="text-lg font-black text-foreground">{hook.name}</h3>
                             <p className="text-xs text-muted-foreground mt-1 font-mono bg-muted/50 px-3 py-1 rounded-lg inline-block">{hook.url}</p>
                          </div>
                       </div>
                       <div className="flex flex-col items-end space-y-2 relative">
                          <div className="absolute -top-4 -right-4">
                             <ActionDropdown 
                                onEdit={() => toast.success('Edit opened')}
                                onDelete={() => handleDelete(hook.id)}
                                onView={() => setInspectPayload(hook)}
                             />
                          </div>
                          <span className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest mt-6 ${
                             hook.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                          }`}>{hook.status}</span>
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Last Event: {hook.time}</span>
                       </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-border">
                       <div className="flex items-center space-x-6">
                          <div className="flex items-center space-x-2">
                             {hook.lastEvent === 'Success' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                             <span className="text-xs font-bold text-foreground">{hook.lastEvent}</span>
                          </div>
                          <div className="text-[10px] text-muted-foreground font-black uppercase">24,502 Total Events</div>
                       </div>
                       <div className="flex items-center space-x-2">
                          <button onClick={() => setInspectPayload(hook)} className="px-4 py-2 bg-muted text-muted-foreground text-[10px] font-black uppercase tracking-widest rounded-xl hover:text-foreground transition-all">Inspect Payload</button>
                          <button onClick={() => handleTest(hook.id)} className="px-4 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all">Test Webhook</button>
                       </div>
                    </div>
                 </div>
              ))}
           </div>

           {/* Webhook Analytics */}
           <aside className="space-y-8">
              <div className="glass-premium p-8 rounded-[40px] border border-border premium-shadow">
                 <h3 className="font-black text-sm uppercase tracking-widest text-foreground mb-8">Event Analytics</h3>
                 <div className="space-y-8">
                    <AnalyticsStat label="Success Rate" value="99.8%" trend="+0.2%" color="emerald" />
                    <AnalyticsStat label="Avg Response" value="142ms" trend="-12ms" color="indigo" />
                    <AnalyticsStat label="Retries Today" value="45" trend="+5" color="amber" />
                 </div>
              </div>

              <div className="glass-premium p-8 rounded-[40px] border border-border premium-shadow bg-muted/30">
                 <h3 className="font-black text-sm uppercase tracking-widest text-foreground mb-6">Recent Events</h3>
                 <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                       <div key={i} className="flex items-center justify-between p-4 bg-background border border-border rounded-2xl">
                          <div className="flex items-center space-x-3">
                             <Database className="w-4 h-4 text-muted-foreground" />
                             <div>
                                <p className="text-[10px] font-black text-foreground">customer.created</p>
                                <p className="text-[8px] text-muted-foreground uppercase font-black">Stripe</p>
                             </div>
                          </div>
                          <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase">200 OK</span>
                       </div>
                    ))}
                 </div>
              </div>
           </aside>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-premium w-full max-w-lg rounded-[40px] border border-border p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-2xl font-black text-foreground">Add New Webhook</h2>
               <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-muted rounded-xl transition-all text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Webhook Name</label>
                  <input name="name" required type="text" className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="e.g. Lead Sync" />
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Endpoint URL</label>
                  <input name="url" required type="url" className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="https://api.example.com/webhook" />
               </div>
               <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/25 hover:opacity-90 transition-all mt-4">Create Webhook</button>
            </form>
          </div>
        </div>
      )}

      {inspectPayload && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-premium w-full max-w-2xl rounded-[40px] border border-border p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
               <div>
                  <h2 className="text-2xl font-black text-foreground">Inspect Payload</h2>
                  <p className="text-xs text-muted-foreground mt-1">{inspectPayload.name}</p>
               </div>
               <button onClick={() => setInspectPayload(null)} className="p-2 hover:bg-muted rounded-xl transition-all text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="bg-muted border border-border rounded-2xl p-6 font-mono text-xs overflow-auto max-h-[400px]">
               <pre className="text-emerald-500">
{`{
  "event": "customer.created",
  "data": {
    "id": "cus_123456789",
    "name": "Jane Doe",
    "email": "jane@example.com"
  },
  "created_at": "2026-04-25T19:50:00Z"
}`}
               </pre>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function AnalyticsStat({ label, value, trend, color }: any) {
  const colors: any = {
    emerald: 'text-emerald-500 bg-emerald-500/10',
    indigo: 'text-indigo-500 bg-indigo-500/10',
    amber: 'text-amber-500 bg-amber-500/10',
  };
  return (
    <div className="flex items-end justify-between">
       <div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
          <p className="text-2xl font-black text-foreground">{value}</p>
       </div>
       <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${colors[color]}`}>{trend}</span>
    </div>
  );
}
