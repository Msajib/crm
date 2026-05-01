'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Plus, 
  Zap, 
  Trash2, 
  Play, 
  Users,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Pause,
  BarChart3,
  Phone,
  MessageSquare,
  Smartphone,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';
import PremiumModal from '@/components/PremiumModal';

const CAMPAIGN_TYPES = [
  { id: 'EMAIL', label: 'Email', icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { id: 'SMS', label: 'SMS', icon: MessageSquare, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'CALL', label: 'Auto Call', icon: Phone, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  { id: 'WHATSAPP', label: 'WhatsApp', icon: Smartphone, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('EMAIL');
  const [step, setStep] = useState(1);

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchCampaigns, 10000); // Polling for updates
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const [campData, tplData, leadData] = await Promise.all([
        api.get('/marketing/campaigns').catch(() => []),
        api.get('/communications/templates').catch(() => []),
        api.get('/contacts').catch(() => ({ data: [] }))
      ]);
      setCampaigns(Array.isArray(campData) ? campData : []);
      setTemplates(Array.isArray(tplData) ? tplData : []);
      setLeads(Array.isArray(leadData?.data) ? leadData.data : []);
    } catch (err) {
      console.error('Failed to sync automation data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const data = await api.get('/marketing/campaigns');
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log('Polling failed');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const selectedLeadIds = Array.from(formData.getAll('leadIds'));
    
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      type: selectedType,
      templateId: formData.get('templateId'),
      leadIds: selectedLeadIds,
      scheduledAt: formData.get('scheduledAt') || new Date().toISOString(),
    };

    if (selectedLeadIds.length === 0) {
      toast.error('Please select at least one lead');
      return;
    }

    try {
      await api.post('/marketing/campaigns', data);
      toast.success(`${selectedType} campaign scheduled`);
      setIsEditorOpen(false);
      fetchCampaigns();
    } catch (err) {
      toast.error('Scheduling failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/marketing/campaigns/${id}`);
      toast.success('Campaign removed');
      fetchCampaigns();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in flex flex-col h-[calc(100vh-160px)]">
        <header className="flex justify-between items-center mb-8">
           <div>
              <h1 className="text-3xl font-black text-foreground mb-1 tracking-tight">Automation Engine</h1>
              <p className="text-muted-foreground text-sm font-medium italic">Omnichannel lead engagement: Email, SMS, Calls, and WhatsApp.</p>
           </div>
           <button 
             onClick={() => setIsEditorOpen(true)}
             className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black flex items-center space-x-3 hover:opacity-90 transition-all shadow-xl shadow-primary/25 active:scale-95"
           >
              <Zap className="w-5 h-5 fill-current" />
              <span>New Campaign</span>
           </button>
        </header>

        <div className="flex-1 overflow-y-auto space-y-6 pr-4 scrollbar-hide pb-20">
           {isLoading ? (
             <div className="py-32 text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground font-bold">Syncing automation clusters...</p>
             </div>
           ) : campaigns.length === 0 ? (
             <div className="py-32 text-center glass-premium rounded-[60px] border border-dashed border-border group">
                <div className="w-24 h-24 bg-muted rounded-[40px] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
                   <Zap className="w-12 h-12 text-muted-foreground/30" />
                </div>
                <h3 className="text-2xl font-black text-foreground mb-3">No Active Campaigns</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-10 font-medium leading-relaxed">Engage your database automatically. Start with an email sequence or an automated call campaign.</p>
                <button 
                  onClick={() => setIsEditorOpen(true)}
                  className="bg-primary/10 text-primary px-10 py-4 rounded-2xl font-black hover:bg-primary hover:text-white transition-all shadow-lg"
                >
                   Launch First Campaign
                </button>
             </div>
           ) : campaigns.map((camp) => (
             <div key={camp.id} className="glass-premium p-10 rounded-[50px] border border-border group hover:border-primary/30 transition-all premium-shadow relative overflow-hidden bg-background/50">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                   <div className="flex items-center space-x-8">
                      <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center shrink-0 shadow-inner ${
                        camp.status === 'RUNNING' ? 'bg-amber-500/20 text-amber-500 animate-pulse' :
                        camp.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-500' :
                        camp.status === 'FAILED' ? 'bg-destructive/20 text-destructive' :
                        'bg-primary/20 text-primary'
                      }`}>
                         {camp.type === 'EMAIL' ? <FileText className="w-10 h-10" /> :
                          camp.type === 'CALL' ? <Phone className="w-10 h-10" /> :
                          camp.type === 'SMS' ? <MessageSquare className="w-10 h-10" /> :
                          <Smartphone className="w-10 h-10" />}
                      </div>
                      <div>
                         <div className="flex items-center space-x-4">
                            <h3 className="text-2xl font-black text-foreground tracking-tight">{camp.name}</h3>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${
                              camp.status === 'RUNNING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                              camp.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                              camp.status === 'FAILED' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                              'bg-primary/10 text-primary border-primary/20'
                            }`}>
                               {camp.status}
                            </span>
                         </div>
                         <div className="flex items-center gap-4 mt-2">
                            <p className="text-sm text-muted-foreground font-medium italic">{camp.description || 'Automated engagement sequence'}</p>
                            <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{camp.type} CHANNEL</span>
                         </div>
                      </div>
                   </div>

                   <div className="flex flex-1 lg:max-w-md items-center space-x-10 px-10 border-x border-border/50">
                      <div className="text-center flex-1">
                         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Reach</p>
                         <p className="text-2xl font-black text-foreground">{camp.leadIds?.length || 0}</p>
                      </div>
                      <div className="text-center flex-1">
                         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Sent</p>
                         <p className="text-2xl font-black text-emerald-500">{camp.processedCount}</p>
                      </div>
                      <div className="text-center flex-1">
                         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Failed</p>
                         <p className="text-2xl font-black text-destructive">{camp.failedCount}</p>
                      </div>
                   </div>

                   <div className="flex items-center space-x-6">
                      <div className="text-right min-w-[140px]">
                         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Execution Date</p>
                         <p className="text-xs font-bold text-foreground">{new Date(camp.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                      </div>
                      <button onClick={() => handleDelete(camp.id)} className="p-5 hover:bg-destructive/10 rounded-3xl transition-all text-destructive group-hover:scale-110">
                         <Trash2 className="w-6 h-6" />
                      </button>
                   </div>
                </div>

                {camp.status === 'RUNNING' && (
                  <div className="mt-10">
                     <div className="flex justify-between items-end mb-3">
                        <p className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                           <BarChart3 className="w-4 h-4 text-primary" />
                           Real-time Throughput: {Math.round((camp.processedCount / (camp.leadIds?.length || 1)) * 100)}%
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground italic flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Est. {Math.max(0, (camp.leadIds?.length - camp.processedCount) * 0.5)} mins left
                        </p>
                     </div>
                     <div className="h-4 bg-muted rounded-full overflow-hidden border border-border shadow-inner p-1">
                        <div 
                          className="h-full bg-gradient-to-r from-primary via-indigo-500 to-purple-500 transition-all duration-1000 rounded-full shadow-lg"
                          style={{ width: `${(camp.processedCount / (camp.leadIds?.length || 1)) * 100}%` }}
                        ></div>
                     </div>
                  </div>
                )}
             </div>
           ))}
        </div>
      </div>

      {/* Campaign Editor Modal (Wizard) */}
      <PremiumModal
        isOpen={isEditorOpen}
        onClose={() => { setIsEditorOpen(false); setStep(1); }}
        title="Campaign Engine"
        subtitle={step === 1 ? "Step 1: Identity & Channel" : step === 2 ? "Step 2: Creative Assets" : "Step 3: Target Audience"}
        maxWidth="max-w-4xl"
        footer={(
          <div className="flex justify-between items-center w-full">
            <div className="flex gap-2">
              {[1, 2, 3].map(s => (
                <div key={s} className={`h-1.5 w-8 rounded-full transition-all ${step >= s ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
            <div className="flex gap-4">
              {step > 1 && (
                <button 
                  onClick={() => setStep(step - 1)}
                  className="px-8 py-4 bg-muted text-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-muted/80 transition-all border border-border"
                >
                  Back
                </button>
              )}
              {step < 3 ? (
                <button 
                  onClick={() => {
                    if (step === 1) {
                      const name = (document.getElementsByName('name')[0] as HTMLInputElement).value;
                      if (!name) { toast.error('Please enter a campaign name'); return; }
                    }
                    setStep(step + 1);
                  }}
                  className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={() => (document.getElementById('campaign-form') as HTMLFormElement)?.requestSubmit()}
                  className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-current" /> Initialize Engine
                </button>
              )}
            </div>
          </div>
        )}
      >
        <form id="campaign-form" onSubmit={handleSave} className="space-y-10">
          {step === 1 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3 col-span-2 lg:col-span-1">
                     <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2">Campaign Identity</label>
                     <input name="name" required className="w-full bg-muted/40 border-2 border-border/50 rounded-3xl px-8 py-5 text-sm font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all shadow-inner" placeholder="e.g. Winter Sales Blast" />
                  </div>
                  <div className="space-y-3 col-span-2 lg:col-span-1">
                     <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2">Launch Schedule</label>
                     <input name="scheduledAt" type="datetime-local" className="w-full bg-muted/40 border-2 border-border/50 rounded-3xl px-8 py-5 text-sm font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all shadow-inner" />
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2">Engagement Channel</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {CAMPAIGN_TYPES.map(type => {
                       const Icon = type.icon;
                       const active = selectedType === type.id;
                       return (
                         <div 
                           key={type.id}
                           onClick={() => setSelectedType(type.id)}
                           className={`p-6 rounded-[32px] border-2 transition-all cursor-pointer flex flex-col items-center gap-3 group relative overflow-hidden ${
                             active ? 'border-primary bg-primary/5 shadow-xl' : 'border-border bg-background hover:border-primary/30'
                           }`}
                         >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${active ? type.bg + ' ' + type.color : 'bg-muted text-muted-foreground'} group-hover:scale-110 transition-transform`}>
                               <Icon className="w-6 h-6" />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{type.label}</span>
                            {active && <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full" />}
                         </div>
                       );
                     })}
                  </div>
               </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2">Creative Asset / Template</label>
                  <div className="relative">
                     <select name="templateId" required className="w-full bg-muted/40 border-2 border-border/50 rounded-3xl px-8 py-6 text-sm font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all shadow-inner appearance-none">
                        <option value="">Select an asset for {selectedType} channel...</option>
                        {templates.filter(t => t.type === selectedType || !t.type).map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                     </select>
                     <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none rotate-90" />
                  </div>
                  <p className="text-[10px] text-muted-foreground ml-2 font-bold italic">Assets are filtered based on the selected channel.</p>
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2">Internal Brief</label>
                  <textarea name="description" rows={4} className="w-full bg-muted/40 border-2 border-border/50 rounded-3xl px-8 py-5 text-sm font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all shadow-inner resize-none" placeholder="What is the strategic objective of this campaign?" />
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="flex justify-between items-center px-2">
                  <div className="flex items-center gap-3">
                     <Users className="w-5 h-5 text-primary" />
                     <div>
                        <h4 className="text-sm font-black text-foreground">Target Audience</h4>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{leads.length} Records Available</p>
                     </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => {
                      const checkboxes = document.getElementsByName('leadIds') as NodeListOf<HTMLInputElement>;
                      const allChecked = Array.from(checkboxes).every(c => c.checked);
                      checkboxes.forEach(c => c.checked = !allChecked);
                    }}
                    className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest"
                  >
                    Toggle Select All
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-4 bg-muted/20 rounded-[40px] border border-border scrollbar-hide shadow-inner">
                  {leads.map(lead => (
                    <label key={lead.id} className="flex items-center p-5 bg-card border border-border/60 rounded-[24px] cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all group relative overflow-hidden">
                       <input type="checkbox" name="leadIds" value={lead.id} defaultChecked className="w-5 h-5 rounded-lg border-2 border-border text-primary focus:ring-primary transition-all mr-5" />
                       <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-foreground truncate">{lead.firstName} {lead.lastName}</p>
                          <p className="text-[10px] text-muted-foreground font-medium truncate">{lead.email || lead.phone || 'No direct contact'}</p>
                       </div>
                       {lead.type === 'CUSTOMER' && <span className="absolute top-2 right-4 text-[8px] font-black text-emerald-500 uppercase">Customer</span>}
                    </label>
                  ))}
               </div>
               
               <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex items-start gap-4">
                  <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-primary/80 leading-relaxed font-medium">
                    You are about to launch a <strong>{selectedType}</strong> campaign. Ensure your credentials are valid in settings before proceeding. 
                    The processing engine will start immediately after confirmation.
                  </p>
               </div>
            </div>
          )}
        </form>
      </PremiumModal>
    </DashboardLayout>
  );
}
