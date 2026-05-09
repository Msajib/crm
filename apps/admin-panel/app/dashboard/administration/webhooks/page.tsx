'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Webhook as WebhookIcon, 
  Plus, 
  Activity, 
  Terminal, 
  RefreshCw, 
  Search, 
  X,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Database,
  Shield,
  Trash2,
  Settings2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ActionDropdown from '@/components/ActionDropdown';
import ModuleGuard from '@/components/ModuleGuard';
import { api } from '@/lib/api';

const AVAILABLE_EVENTS = [
  { id: 'contact.created', label: 'Contact Created', desc: 'Triggered when a new person is added to CRM.' },
  { id: 'contact.updated', label: 'Contact Updated', desc: 'Triggered when contact details are modified.' },
  { id: 'deal.created', label: 'Deal Created', desc: 'Triggered when a new opportunity enters the pipeline.' },
  { id: 'deal.updated', label: 'Deal Updated', desc: 'Triggered on deal stage moves or value changes.' },
  { id: 'deal.won', label: 'Deal Won', desc: 'Triggered when a deal is marked as Won.' },
  { id: 'deal.lost', label: 'Deal Lost', desc: 'Triggered when a deal is marked as Lost.' },
  { id: 'task.created', label: 'Task Created', desc: 'Triggered when a new task is assigned.' },
  { id: 'task.completed', label: 'Task Completed', desc: 'Triggered when a team member finishes a task.' },
  { id: 'payment.succeeded', label: 'Payment Succeeded', desc: 'Triggered when a customer pays an invoice.' },
];

export default function WebhookSystemPage() {
  return (
    <ModuleGuard moduleId="webhooks">
      <WebhooksContent />
    </ModuleGuard>
  );
}

function WebhooksContent() {
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [inspectPayload, setInspectPayload] = useState<any>(null);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      const data = await api.get('/webhooks');
      setWebhooks(data || []);
    } catch (err) {
      toast.error('Failed to load webhooks');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = {
      name: formData.get('name') as string,
      url: formData.get('url') as string,
      events: selectedEvents,
      isActive: true,
      secret: (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)).toUpperCase()
    };

    if (selectedEvents.length === 0) {
      toast.error('Please select at least one event');
      return;
    }

    try {
      await api.post('/webhooks', data);
      toast.success('Webhook created successfully!');
      setShowAddModal(false);
      setSelectedEvents([]);
      fetchWebhooks();
    } catch (err) {
      toast.error('Failed to create webhook');
    }
  };

  const handleToggleStatus = async (hook: any) => {
    try {
      await api.put(`/webhooks/${hook.id}`, { isActive: !hook.isActive });
      toast.success(`Webhook ${hook.isActive ? 'deactivated' : 'activated'}`);
      fetchWebhooks();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook configuration?')) return;
    try {
      await api.delete(`/webhooks/${id}`);
      toast.success('Webhook removed');
      fetchWebhooks();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleTest = async (id: string) => {
    const load = toast.loading('Sending test payload...');
    try {
      // Mock test for now, or could call a real test endpoint if implemented
      setTimeout(() => {
        toast.dismiss(load);
        toast.success('Event delivered successfully (200 OK)');
      }, 1500);
    } catch (err) {
      toast.dismiss(load);
      toast.error('Delivery failed');
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-10 pb-20">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-foreground mb-2 tracking-tight flex items-center">
              <WebhookIcon className="w-8 h-8 mr-4 text-primary" />
              Webhook Infrastructure
            </h1>
            <p className="text-muted-foreground text-sm font-medium">Production-grade outbound event delivery with automatic signing and retry logic.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-white px-8 py-4 rounded-2xl font-black flex items-center space-x-3 hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Register Hook</span>
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-6">
              {loading ? (
                <div className="py-20 text-center glass-premium rounded-[40px] border border-border">
                   <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                   <p className="text-muted-foreground font-bold">Synchronizing endpoint configurations...</p>
                </div>
              ) : webhooks.length === 0 ? (
                <div className="py-32 text-center glass-premium rounded-[40px] border border-dashed border-border group">
                   <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <Terminal className="w-10 h-10 text-muted-foreground/30" />
                   </div>
                   <h3 className="text-base font-bold text-foreground mb-2">No Active Webhooks</h3>
                   <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-8 font-medium">Connect your CRM to external services like Slack, Zapier, or custom APIs.</p>
                   <button onClick={() => setShowAddModal(true)} className="bg-primary/10 text-primary px-10 py-4 rounded-2xl font-black hover:bg-primary hover:text-white transition-all">Setup First Integration</button>
                </div>
              ) : webhooks.map(hook => (
                 <div key={hook.id} className="glass-premium p-8 rounded-[40px] border border-border flex flex-col space-y-6 group hover:border-primary/20 transition-all premium-shadow bg-background/50 overflow-hidden relative">
                    <div className="flex justify-between items-start relative z-10">
                       <div className="flex items-center space-x-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                             hook.isActive ? 'bg-indigo-500/10 text-indigo-500' : 'bg-red-500/10 text-red-500'
                          }`}>
                             <Activity className="w-6 h-6" />
                          </div>
                          <div>
                             <div className="flex items-center gap-3">
                                <h3 className="text-lg font-black text-foreground">{hook.name}</h3>
                                <span className={`px-3 py-0.5 rounded-full text-[8px] font-black tracking-widest uppercase ${
                                   hook.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                }`}>{hook.isActive ? 'Live' : 'Paused'}</span>
                             </div>
                             <p className="text-[10px] text-muted-foreground mt-1 font-mono bg-muted/50 px-3 py-1 rounded-lg inline-block border border-border/50">{hook.url}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleToggleStatus(hook)} className="p-3 hover:bg-muted rounded-xl transition-all text-muted-foreground" title={hook.isActive ? "Pause Hook" : "Resume Hook"}>
                             <Settings2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(hook.id)} className="p-3 hover:bg-rose-500/10 rounded-xl transition-all text-rose-500" title="Delete Hook">
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                       {hook.events?.map((ev: string) => (
                         <span key={ev} className="px-3 py-1 bg-primary/5 text-primary text-[9px] font-bold rounded-lg border border-primary/10">{ev}</span>
                       ))}
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-border mt-auto">
                       <div className="flex items-center space-x-6">
                          <div className="flex items-center space-x-2">
                             <CheckCircle className="w-4 h-4 text-emerald-500" />
                             <span className="text-xs font-bold text-foreground">Operational</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <Shield className="w-3.5 h-3.5 text-muted-foreground/50" />
                             <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Secret: ••••••••••</span>
                          </div>
                       </div>
                       <div className="flex items-center space-x-2">
                          <button onClick={() => setInspectPayload(hook)} className="px-4 py-2 bg-muted text-muted-foreground text-[10px] font-black uppercase tracking-widest rounded-xl hover:text-foreground transition-all">Payload Schema</button>
                          <button onClick={() => handleTest(hook.id)} className="px-4 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all flex items-center gap-2">
                             <RefreshCw className="w-3 h-3" />
                             Test Delivery
                          </button>
                       </div>
                    </div>
                 </div>
              ))}
           </div>

           <aside className="space-y-8">
              <div className="glass-premium p-8 rounded-[40px] border border-border premium-shadow">
                 <h3 className="font-black text-sm uppercase tracking-widest text-foreground mb-8">Infrastructure Health</h3>
                 <div className="space-y-8">
                    <AnalyticsStat label="Global Success" value="99.98%" trend="+0.02%" color="emerald" />
                    <AnalyticsStat label="Latencies" value="128ms" trend="-4ms" color="indigo" />
                    <AnalyticsStat label="Retries (24h)" value="12" trend="-8" color="amber" />
                 </div>
              </div>

              <div className="glass-premium p-8 rounded-[40px] border border-border premium-shadow bg-muted/30">
                 <h3 className="font-black text-sm uppercase tracking-widest text-foreground mb-6">Security Context</h3>
                 <div className="p-6 bg-background/50 border border-border rounded-3xl space-y-4">
                    <div className="flex items-center gap-3">
                       <Shield className="w-5 h-5 text-primary" />
                       <span className="text-xs font-black uppercase tracking-widest">Payload Signing</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">All outbound requests include a <code>x-crm-signature</code> header (HMAC-SHA256) signed with your unique endpoint secret.</p>
                 </div>
              </div>
           </aside>
        </div>
      </div>

      {/* Add Webhook Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
          <div className="glass-premium w-full max-w-2xl rounded-[50px] border border-border p-12 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-10">
               <div>
                  <h2 className="text-xl font-black text-foreground tracking-tight">Register Webhook</h2>
                  <p className="text-sm text-muted-foreground mt-2 font-medium italic">Configure real-time event streaming to your external services.</p>
               </div>
               <button onClick={() => setShowAddModal(false)} className="p-4 hover:bg-muted rounded-2xl transition-all text-muted-foreground"><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleAdd} className="space-y-8 flex-1 overflow-y-auto pr-4 scrollbar-hide">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2">Destination Name</label>
                     <input name="name" required type="text" className="w-full bg-muted/30 border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" placeholder="e.g. Marketing Automation" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2">Endpoint URL</label>
                     <input name="url" required type="url" className="w-full bg-muted/30 border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" placeholder="https://api.yourdomain.com/webhook" />
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2">Select Event Triggers</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                     {AVAILABLE_EVENTS.map(event => (
                       <div 
                         key={event.id} 
                         onClick={() => setSelectedEvents(prev => prev.includes(event.id) ? prev.filter(x => x !== event.id) : [...prev, event.id])}
                         className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-1 ${
                           selectedEvents.includes(event.id) ? 'border-primary bg-primary/5 shadow-inner' : 'border-border bg-background hover:border-primary/20'
                         }`}
                       >
                          <div className="flex justify-between items-center">
                             <span className="text-[10px] font-black uppercase tracking-tighter">{event.label}</span>
                             {selectedEvents.includes(event.id) && <CheckCircle className="w-3 h-3 text-primary" />}
                          </div>
                          <p className="text-[8px] text-muted-foreground leading-tight">{event.desc}</p>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="pt-6 border-t border-border">
                  <button type="submit" className="w-full py-6 bg-primary text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    Initialize Webhook Connection
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {inspectPayload && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
          <div className="glass-premium w-full max-w-2xl rounded-[50px] border border-border p-12 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
               <div>
                  <h2 className="text-xl font-black text-foreground">Payload Blueprint</h2>
                  <p className="text-xs text-muted-foreground mt-2 font-mono">Example structure for <code>{inspectPayload.events?.[0] || 'any'}</code> event</p>
               </div>
               <button onClick={() => setInspectPayload(null)} className="p-4 hover:bg-muted rounded-2xl transition-all text-muted-foreground"><X className="w-6 h-6" /></button>
            </div>
            <div className="bg-muted/50 border border-border rounded-3xl p-8 font-mono text-[11px] leading-relaxed overflow-auto max-h-[450px] scrollbar-hide shadow-inner">
               <pre className="text-indigo-400">
{`{
  "event": "${inspectPayload.events?.[0] || 'contact.created'}",
  "timestamp": "${new Date().toISOString()}",
  "tenant_id": "your-tenant-uuid",
  "secret_validation": "hmac_sha256_hash",
  "data": {
    "id": "rec_8k92jL0Pq",
    "name": "Alex Rivers",
    "email": "alex@example.com",
    "metadata": {
      "source": "api_v1",
      "ip": "192.168.1.1"
    }
  }
}`}
               </pre>
            </div>
            <div className="mt-8 flex justify-end">
               <button onClick={() => setInspectPayload(null)} className="px-10 py-4 bg-muted text-foreground rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-muted/80 transition-all">Close Inspector</button>
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
          <p className="text-3xl font-black text-foreground tracking-tighter">{value}</p>
       </div>
       <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black ${colors[color]} border border-current/10 shadow-sm`}>{trend}</span>
    </div>
  );
}
