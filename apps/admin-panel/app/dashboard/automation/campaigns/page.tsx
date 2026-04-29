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
  BarChart3
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

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
      type: 'EMAIL',
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
      toast.success('Campaign scheduled');
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
              <h1 className="text-3xl font-black text-foreground mb-1 tracking-tight">Marketing Campaigns</h1>
              <p className="text-muted-foreground text-sm font-medium italic">Schedule and monitor automated lead engagement sequences.</p>
           </div>
           <button 
             onClick={() => setIsEditorOpen(true)}
             className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 hover:opacity-90 transition-all shadow-lg shadow-primary/25"
           >
              <Zap className="w-5 h-5 fill-current" />
              <span>New Campaign</span>
           </button>
        </header>

        <div className="flex-1 overflow-y-auto space-y-6 pr-4 scrollbar-hide">
           {isLoading ? (
             <div className="py-32 text-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Syncing campaign engine...</p>
             </div>
           ) : campaigns.length === 0 ? (
             <div className="py-32 text-center glass-premium rounded-[60px] border border-dashed border-border">
                <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6">
                   <Zap className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No Active Campaigns</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-8">Engage your leads automatically with personalized email sequences.</p>
                <button 
                  onClick={() => setIsEditorOpen(true)}
                  className="bg-primary/10 text-primary px-8 py-3 rounded-2xl font-bold hover:bg-primary/20 transition-all"
                >
                   Launch First Campaign
                </button>
             </div>
           ) : campaigns.map((camp) => (
             <div key={camp.id} className="glass-premium p-8 rounded-[40px] border border-border group hover:border-primary/30 transition-all premium-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                   <div className="flex items-center space-x-6">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
                        camp.status === 'RUNNING' ? 'bg-amber-500/20 text-amber-500 animate-pulse' :
                        camp.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-500' :
                        camp.status === 'FAILED' ? 'bg-destructive/20 text-destructive' :
                        'bg-primary/20 text-primary'
                      }`}>
                         {camp.status === 'RUNNING' ? <Play className="w-8 h-8 fill-current" /> : 
                          camp.status === 'COMPLETED' ? <CheckCircle2 className="w-8 h-8" /> :
                          camp.status === 'FAILED' ? <AlertCircle className="w-8 h-8" /> :
                          <Clock className="w-8 h-8" />}
                      </div>
                      <div>
                         <div className="flex items-center space-x-3">
                            <h3 className="text-xl font-black text-foreground tracking-tight">{camp.name}</h3>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                              camp.status === 'RUNNING' ? 'bg-amber-500/10 text-amber-500' :
                              camp.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' :
                              camp.status === 'FAILED' ? 'bg-destructive/10 text-destructive' :
                              'bg-primary/10 text-primary'
                            }`}>
                               {camp.status}
                            </span>
                         </div>
                         <p className="text-sm text-muted-foreground font-medium mt-1 italic">{camp.description || 'No description provided.'}</p>
                      </div>
                   </div>

                   <div className="flex flex-1 lg:max-w-md items-center space-x-8 px-8 border-x border-border/50">
                      <div className="text-center flex-1">
                         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Reach</p>
                         <p className="text-xl font-black text-foreground">{camp.leadIds?.length || 0}</p>
                      </div>
                      <div className="text-center flex-1">
                         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Sent</p>
                         <p className="text-xl font-black text-emerald-500">{camp.processedCount}</p>
                      </div>
                      <div className="text-center flex-1">
                         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Failed</p>
                         <p className="text-xl font-black text-destructive">{camp.failedCount}</p>
                      </div>
                   </div>

                   <div className="flex items-center space-x-4">
                      <div className="text-right min-w-[120px]">
                         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Scheduled For</p>
                         <p className="text-xs font-bold text-foreground">{new Date(camp.scheduledAt).toLocaleString()}</p>
                      </div>
                      <button onClick={() => handleDelete(camp.id)} className="p-4 hover:bg-destructive/10 rounded-2xl transition-all text-destructive">
                         <Trash2 className="w-5 h-5" />
                      </button>
                   </div>
                </div>

                {camp.status === 'RUNNING' && (
                  <div className="mt-8">
                     <div className="flex justify-between items-end mb-2">
                        <p className="text-xs font-black text-foreground uppercase tracking-widest flex items-center">
                           <BarChart3 className="w-3 h-3 mr-2 text-primary" />
                           Progress: {Math.round((camp.processedCount / (camp.leadIds?.length || 1)) * 100)}%
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground italic">Approx. {Math.max(0, (camp.leadIds?.length - camp.processedCount) * 0.5)} mins remaining</p>
                     </div>
                     <div className="h-3 bg-muted rounded-full overflow-hidden border border-border">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500 shadow-lg shadow-primary/30"
                          style={{ width: `${(camp.processedCount / (camp.leadIds?.length || 1)) * 100}%` }}
                        ></div>
                     </div>
                  </div>
                )}
             </div>
           ))}
        </div>
      </div>

      {/* Campaign Editor */}
      {isEditorOpen && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
           <div className="glass-premium w-full max-w-4xl rounded-[50px] border border-border p-12 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center mb-10">
                 <div>
                    <h2 className="text-3xl font-black text-foreground tracking-tight">New Marketing Campaign</h2>
                    <p className="text-sm text-muted-foreground mt-2 font-medium">Define your audience and engagement schedule.</p>
                 </div>
                 <button onClick={() => setIsEditorOpen(false)} className="p-4 hover:bg-muted rounded-2xl transition-all text-muted-foreground"><X className="w-6 h-6" /></button>
              </div>
              
              <form onSubmit={handleSave} className="space-y-6 flex-1 overflow-y-auto pr-4 scrollbar-hide">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2 col-span-2 lg:col-span-1">
                       <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2">Campaign Name</label>
                       <input name="name" required className="w-full bg-muted/30 border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" placeholder="e.g. Q4 Lead Reactivation" />
                    </div>
                    <div className="space-y-2 col-span-2 lg:col-span-1">
                       <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2">Schedule Start</label>
                       <input name="scheduledAt" type="datetime-local" className="w-full bg-muted/30 border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2">Description</label>
                    <input name="description" className="w-full bg-muted/30 border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" placeholder="Optional brief about the goal..." />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2">Select Template</label>
                       <select name="templateId" required className="w-full bg-muted/30 border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all appearance-none">
                          <option value="">Choose a template...</option>
                          {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2">Action Type</label>
                       <div className="flex space-x-2">
                          <div className="flex-1 bg-primary text-primary-foreground p-4 rounded-2xl flex items-center justify-center space-x-2 font-black text-xs uppercase tracking-widest border border-primary/20">
                             <FileText className="w-4 h-4" />
                             <span>Email</span>
                          </div>
                          <div className="flex-1 bg-muted/30 text-muted-foreground p-4 rounded-2xl flex items-center justify-center space-x-2 font-black text-xs uppercase tracking-widest border border-border opacity-50 cursor-not-allowed">
                             <Users className="w-4 h-4" />
                             <span>SMS (TBA)</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2 flex justify-between items-center">
                       <span>Target Leads</span>
                       <span className="text-primary normal-case font-bold">{leads.length} Available</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2 bg-muted/20 rounded-3xl border border-border scrollbar-hide">
                       {leads.map(lead => (
                         <label key={lead.id} className="flex items-center p-4 bg-card border border-border rounded-2xl cursor-pointer hover:border-primary/50 transition-all group">
                            <input type="checkbox" name="leadIds" value={lead.id} className="w-5 h-5 rounded-lg border-2 border-border text-primary focus:ring-primary transition-all mr-4" />
                            <div>
                               <p className="text-xs font-black text-foreground">{lead.firstName} {lead.lastName}</p>
                               <p className="text-[10px] text-muted-foreground font-medium">{lead.email}</p>
                            </div>
                         </label>
                       ))}
                    </div>
                 </div>

                 <div className="flex space-x-4 pt-6">
                    <button type="button" onClick={() => setIsEditorOpen(false)} className="flex-1 py-5 bg-muted text-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-muted/80 transition-all">Cancel</button>
                    <button type="submit" className="flex-[2] py-5 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/30 hover:opacity-90 transition-all flex items-center justify-center space-x-2">
                       <Zap className="w-4 h-4 fill-current" />
                       <span>Initialize Campaign</span>
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </DashboardLayout>
  );
}
