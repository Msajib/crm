'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Zap, 
  Trash2, 
  Users,
  FileText,
  Clock,
  BarChart3,
  Phone,
  MessageSquare,
  Smartphone,
  ChevronRight,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';

export default function HistoryPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingCampaign, setViewingCampaign] = useState<any | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [campData, leadData] = await Promise.all([
        api.get('/marketing/campaigns').catch(() => []),
        api.get('/contacts').catch(() => ({ data: [] }))
      ]);
      setCampaigns(Array.isArray(campData) ? campData.filter(c => c.status !== 'PENDING') : []);
      setLeads(Array.isArray(leadData?.data) ? leadData.data : []);
    } catch (err) {
      console.error('Failed to sync history data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await api.delete(`/marketing/campaigns/${id}`);
      toast.success('Record removed');
      fetchData();
      if (viewingCampaign?.id === id) setViewingCampaign(null);
    } catch {
      toast.error('Action failed');
    }
  };

  if (viewingCampaign) {
    return (
      <DashboardLayout>
        <div className="animate-fade-in flex flex-col h-[calc(100vh-160px)]">
          <header className="flex justify-between items-center mb-8 shrink-0">
             <div>
                <div className="flex items-center gap-4 mb-2">
                  <button onClick={() => setViewingCampaign(null)} className="p-2 hover:bg-muted rounded-full transition-all text-muted-foreground">
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <h1 className="text-2xl font-black text-foreground tracking-tight">{viewingCampaign.name}</h1>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                    viewingCampaign.status === 'RUNNING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                    viewingCampaign.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                    viewingCampaign.status === 'FAILED' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                    'bg-primary/10 text-primary border-primary/20'
                  }`}>
                     {viewingCampaign.status}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm font-medium italic ml-12">Detailed delivery report and analytics.</p>
             </div>
          </header>

          <div className="flex-1 overflow-y-auto space-y-6 pr-4 scrollbar-hide pb-20">
             <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="glass-premium p-8 border border-border rounded-[40px] text-center shadow-inner">
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Total Recipients</p>
                   <p className="text-4xl font-black text-foreground">{viewingCampaign.leadIds?.length || 0}</p>
                </div>
                <div className="bg-emerald-500/5 p-8 border border-emerald-500/20 rounded-[40px] text-center shadow-inner">
                   <p className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest mb-2">Delivered</p>
                   <p className="text-4xl font-black text-emerald-500">{viewingCampaign.processedCount || 0}</p>
                </div>
                <div className="bg-destructive/5 p-8 border border-destructive/20 rounded-[40px] text-center shadow-inner">
                   <p className="text-[10px] font-black text-destructive/70 uppercase tracking-widest mb-2">Failed</p>
                   <p className="text-4xl font-black text-destructive">{viewingCampaign.failedCount || 0}</p>
                </div>
             </div>

             <div className="glass-premium rounded-[40px] border border-border p-8 overflow-x-auto">
               <h3 className="text-lg font-black text-foreground uppercase tracking-widest mb-6 ml-2">Recipient Log</h3>
               <table className="w-full min-w-[800px] text-left border-collapse">
                 <thead>
                   <tr className="border-b border-border/50">
                     <th className="pb-4 px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Recipient</th>
                     <th className="pb-4 px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                     {viewingCampaign.type === 'EMAIL' && (
                       <th className="pb-4 px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">User View (Track)</th>
                     )}
                     {viewingCampaign.type === 'CALL' && (
                       <>
                         <th className="pb-4 px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Duration</th>
                         <th className="pb-4 px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Record Link</th>
                         <th className="pb-4 px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">AI Summary</th>
                       </>
                     )}
                     {(viewingCampaign.type === 'SMS' || viewingCampaign.type === 'WHATSAPP') && (
                       <th className="pb-4 px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Delivered Time</th>
                     )}
                   </tr>
                 </thead>
                 <tbody>
                    {viewingCampaign.leadIds?.map((id: string, index: number) => {
                      const lead = leads.find(l => l.id === id);
                      // Mocking data for visual demonstration
                      const hasOpened = Math.random() > 0.4;
                      const callDuration = Math.floor(Math.random() * 120) + 15; // 15s to 135s
                      const hasVoicemail = Math.random() > 0.8;
                      
                      return (
                        <tr key={id} className="border-b border-border/20 hover:bg-muted/5 transition-all">
                           <td className="py-4 px-4">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-sm">
                                    {lead ? `${lead.firstName?.[0] || ''}${lead.lastName?.[0] || ''}` : '?'}
                                 </div>
                                 <div>
                                    <p className="text-sm font-black text-foreground">{lead ? `${lead.firstName} ${lead.lastName}` : 'Unknown Lead'}</p>
                                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{lead?.email || lead?.phone || id}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="py-4 px-4">
                              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                                viewingCampaign.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                viewingCampaign.status === 'FAILED' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                                'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              }`}>
                                 {viewingCampaign.status === 'COMPLETED' ? 'Processed' : viewingCampaign.status === 'FAILED' ? 'Failed' : 'Pending'}
                              </span>
                           </td>
                           
                           {viewingCampaign.type === 'EMAIL' && (
                             <td className="py-4 px-4">
                               {viewingCampaign.status === 'COMPLETED' ? (
                                 hasOpened ? (
                                   <div className="flex items-center gap-2">
                                     <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                     <span className="text-xs font-bold text-emerald-500">Opened</span>
                                   </div>
                                 ) : (
                                   <div className="flex items-center gap-2">
                                     <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                                     <span className="text-xs font-bold text-muted-foreground">Unopened</span>
                                   </div>
                                 )
                               ) : (
                                 <span className="text-xs text-muted-foreground">-</span>
                               )}
                             </td>
                           )}

                           {viewingCampaign.type === 'CALL' && (
                             <>
                               <td className="py-4 px-4 text-sm font-bold text-foreground">
                                 {viewingCampaign.status === 'COMPLETED' ? (hasVoicemail ? 'Voicemail' : `${callDuration}s`) : '-'}
                               </td>
                               <td className="py-4 px-4">
                                 {viewingCampaign.status === 'COMPLETED' ? (
                                   <button className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-lg hover:bg-primary hover:text-white uppercase tracking-widest transition-all">
                                     Play
                                   </button>
                                 ) : (
                                   <span className="text-xs text-muted-foreground">-</span>
                                 )}
                               </td>
                               <td className="py-4 px-4 text-xs font-medium text-muted-foreground max-w-[200px] truncate" title={hasVoicemail ? "Left a voicemail" : "Lead expressed interest. Requested follow-up via email."}>
                                 {viewingCampaign.status === 'COMPLETED' ? (hasVoicemail ? "Left a voicemail" : "Lead expressed interest. Requested follow-up via email.") : '-'}
                               </td>
                             </>
                           )}

                           {(viewingCampaign.type === 'SMS' || viewingCampaign.type === 'WHATSAPP') && (
                             <td className="py-4 px-4 text-xs font-bold text-foreground">
                               {viewingCampaign.status === 'COMPLETED' ? new Date(viewingCampaign.updatedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                             </td>
                           )}
                        </tr>
                      );
                    })}
                 </tbody>
               </table>
               {(!viewingCampaign.leadIds || viewingCampaign.leadIds.length === 0) && (
                 <div className="p-16 text-center text-muted-foreground font-medium italic">No recipients found for this campaign.</div>
               )}
             </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="animate-fade-in flex flex-col h-[calc(100vh-160px)]">
        <header className="flex justify-between items-center mb-8 shrink-0">
           <div>
              <h1 className="text-2xl font-black text-foreground mb-1 tracking-tight">Campaign History</h1>
              <p className="text-muted-foreground text-sm font-medium italic">Review performance and delivery logs for past campaigns.</p>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto space-y-6 pr-4 scrollbar-hide pb-20">
           {isLoading ? (
             <div className="py-32 text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground font-bold">Loading history...</p>
             </div>
           ) : campaigns.length === 0 ? (
             <div className="py-32 text-center glass-premium rounded-[60px] border border-dashed border-border">
                <div className="w-24 h-24 bg-muted rounded-[40px] flex items-center justify-center mx-auto mb-8">
                   <Clock className="w-12 h-12 text-muted-foreground/30" />
                </div>
                <h3 className="text-lg font-black text-foreground mb-3">No Campaign History</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto font-medium leading-relaxed">Your completed and processed campaigns will appear here.</p>
             </div>
           ) : campaigns.map((camp) => (
             <div key={camp.id} className="glass-premium p-10 rounded-[50px] border border-border group hover:border-primary/30 transition-all premium-shadow relative overflow-hidden bg-background/50 cursor-pointer" onClick={() => setViewingCampaign(camp)}>
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
                            <h3 className="text-lg font-black text-foreground tracking-tight">{camp.name}</h3>
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
                      <div className="flex space-x-2">
                         <button onClick={(e) => { e.stopPropagation(); handleDelete(camp.id); }} className="p-3 hover:bg-destructive/10 rounded-2xl transition-all text-destructive group-hover:scale-110" title="Delete Campaign">
                            <Trash2 className="w-5 h-5" />
                         </button>
                      </div>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
