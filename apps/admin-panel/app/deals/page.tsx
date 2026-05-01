'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  DollarSign,
  Calendar,
  Layers,
  X,
  Building2,
  Briefcase,
  Settings,
  Filter,
  ArrowRight,
  TrendingUp,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Activity as ActivityIcon,
  Phone,
  Mail,
  FileText,
  User,
  GripVertical
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ActionDropdown from '@/components/ActionDropdown';
import RichTextEditor from '@/components/RichTextEditor';
import ModuleGuard from '@/components/ModuleGuard';
import PremiumModal from '@/components/PremiumModal';
import { api } from '@/lib/api';

export default function DealsPage() {
  return (
    <ModuleGuard moduleId="deals">
      <Suspense fallback={<div>Loading deals...</div>}>
        <DealsContent />
      </Suspense>
    </ModuleGuard>
  );
}

function DealsContent() {
  const searchParams = useSearchParams();
  const dealIdFromQuery = searchParams.get('id');
  const [deals, setDeals] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [activePipelineId, setActivePipelineId] = useState<string>('');
  
  const [newDeal, setNewDeal] = useState({ 
    title: '', 
    contactId: '', 
    pipelineId: '', 
    stageId: '', 
    value: 0, 
    description: '',
    closeDate: '',
    assignedTo: ''
  });
  
  const [editDeal, setEditDeal] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const [dealsRes, staffRes] = await Promise.all([
        api.get('/deals'),
        api.get('/users/staff').catch(() => ({ data: [] })) 
      ]);
      
      setDeals(dealsRes.data || []);
      setStaffList(staffRes.data || []);
    } catch (err) {
      toast.error('Failed to load deal data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPipelines = async () => {
    try {
      const data = await api.get('/pipelines');
      setPipelines(data || []);
      if (data.length > 0 && !activePipelineId) {
        const defaultP = data.find((p: any) => p.isDefault) || data[0];
        setActivePipelineId(defaultP.id);
      }
    } catch (err) {
      console.error('Failed to load pipelines');
    }
  };

  const fetchRecentActivities = async () => {
    try {
      // In a real app, this would be a dedicated activity endpoint
      // For now, let's just use some mock or aggregated data if not available
      const data = await api.get('/dashboard/stats').catch(() => null);
      // Mocking some activities for the redesigned feed
      setActivities([
        { id: '1', type: 'CALL', subject: 'Discovery Call', contact: 'Alex Rivers', time: '2h ago', status: 'completed' },
        { id: '2', type: 'EMAIL', subject: 'Proposal Sent', contact: 'Sarah Chen', time: '4h ago', status: 'pending' },
        { id: '3', type: 'NOTE', subject: 'Stakeholder Meeting', contact: 'John Doe', time: '1d ago', status: 'completed' },
      ]);
    } catch (e) {}
  };

  useEffect(() => {
    fetchDeals();
    fetchPipelines();
    fetchRecentActivities();
  }, []);

  // Handle opening deal from query param
  useEffect(() => {
    if (dealIdFromQuery && deals.length > 0) {
      const deal = deals.find(d => d.id === dealIdFromQuery);
      if (deal) setSelectedDeal(deal);
    }
  }, [dealIdFromQuery, deals]);

  const activePipeline = useMemo(() => 
    pipelines.find(p => p.id === activePipelineId) || pipelines[0]
  , [pipelines, activePipelineId]);

  const dealsByStage = useMemo(() => {
    return deals.reduce((acc: any, deal: any) => {
      const stageId = deal.stageId;
      if (!acc[stageId]) acc[stageId] = [];
      acc[stageId].push(deal);
      return acc;
    }, {});
  }, [deals]);

  // Statistics
  const stats = useMemo(() => {
    const activeDeals = deals.filter(d => d.pipelineId === activePipelineId);
    const totalValue = activeDeals.reduce((sum, d) => sum + (d.value || 0), 0);
    const avgValue = activeDeals.length > 0 ? totalValue / activeDeals.length : 0;
    const winRate = 68; // Mocked for now
    
    return {
      totalValue,
      avgValue,
      count: activeDeals.length,
      winRate
    };
  }, [deals, activePipelineId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...newDeal,
        value: Number(newDeal.value) || 0,
        closeDate: newDeal.closeDate || undefined,
      };

      await api.post('/deals', payload);
      toast.success('Opportunity created!');
      setShowAddModal(false);
      fetchDeals();
    } catch (err: any) {
      toast.error(err.message || 'Creation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this deal?')) return;
    try {
      await api.delete(`/deals/${id}`);
      toast.success('Deal removed');
      fetchDeals();
      if (selectedDeal?.id === id) setSelectedDeal(null);
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDeal) return;
    try {
      const payload = {
        title: editDeal.title,
        value: Number(editDeal.value) || 0,
        stageId: editDeal.stageId,
        description: editDeal.description,
        assignedTo: editDeal.assignedTo,
        status: editDeal.status,
      };

      await api.put(`/deals/${editDeal.id}`, payload);
      toast.success('Opportunity updated');
      setShowEditModal(false);
      fetchDeals();
      setSelectedDeal(null);
    } catch (err: any) {
      toast.error(err.message || 'Update failed');
    }
  };

  const getStaffName = (id: string) => {
    const staff = staffList.find(s => s.id === id);
    return staff ? `${staff.firstName} ${staff.lastName}` : 'Unassigned';
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-[1600px] mx-auto space-y-8 pb-20">
        
        {/* Top Header & Pipeline Selector */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Target className="w-6 h-6" />
               </div>
               <h1 className="text-3xl font-black text-foreground tracking-tight">Revenue Pipeline</h1>
            </div>
            <p className="text-muted-foreground text-sm font-medium ml-13">Streamline your sales workflow and accelerate deal closure.</p>
          </div>

          <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-2xl border border-border/50">
             <div className="flex items-center px-4 gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select 
                  value={activePipelineId} 
                  onChange={(e) => setActivePipelineId(e.target.value)}
                  className="bg-transparent border-none text-sm font-black focus:ring-0 cursor-pointer"
                >
                   {pipelines.length > 0 ? (
                     pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)
                   ) : (
                     <option value="">No Pipeline Found</option>
                   )}
                </select>
             </div>
             <div className="w-px h-8 bg-border" />
             <button 
               onClick={() => {
                 if (pipelines.length === 0) {
                    toast.error('No pipelines detected. Please create one in System Settings first.', {
                      icon: '⚠️',
                      duration: 4000
                    });
                    return;
                 }
                 setShowAddModal(true);
               }}
               className="bg-primary text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
             >
                <Plus className="w-4 h-4" />
                New Deal
             </button>
          </div>
        </header>

        {pipelines.length === 0 && !loading && (
          <div className="bg-amber-500/10 border border-amber-500/20 p-8 rounded-[32px] flex items-center justify-between animate-pulse">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-600">
                   <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-sm font-black text-amber-900 uppercase tracking-widest">Pipeline Required</h3>
                   <p className="text-xs text-amber-700 font-medium">You cannot create or manage deals without an active pipeline. Configure your sales stages in settings.</p>
                </div>
             </div>
             <Link href="/dashboard/settings/pipelines" className="px-6 py-3 bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20">
                Go to Pipeline Settings
             </Link>
          </div>
        )}

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <StatCard label="Pipeline Value" value={`$${stats.totalValue.toLocaleString()}`} icon={DollarSign} color="emerald" trend="+12% vs last month" />
           <StatCard label="Active Deals" value={String(stats.count)} icon={Briefcase} color="indigo" trend="4 new this week" />
           <StatCard label="Average Deal" value={`$${Math.round(stats.avgValue).toLocaleString()}`} icon={TrendingUp} color="purple" trend="Stable" />
           <StatCard label="Win Probability" value={`${stats.winRate}%`} icon={CheckCircle2} color="amber" trend="+5.2% improvement" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-10 items-start">
           
           {/* Main Kanban Board */}
           <div className="xl:col-span-3">
              <div className="flex gap-6 overflow-x-auto pb-10 custom-scrollbar snap-x snap-mandatory">
                {(activePipeline?.stages || []).map((stage: any) => (
                  <div key={stage.id} className="w-[350px] shrink-0 snap-start flex flex-col gap-6">
                    <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-md border-b border-border/50 rounded-t-[32px]">
                       <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ backgroundColor: stage.color, boxShadow: `0 0 10px ${stage.color}40` }} />
                          <h3 className="text-[11px] font-black text-foreground uppercase tracking-widest">{stage.name}</h3>
                          <span className="px-2 py-0.5 bg-muted/50 rounded-lg text-[9px] font-black text-muted-foreground border border-border/50">
                             {dealsByStage[stage.id]?.length || 0}
                          </span>
                       </div>
                       <div className="text-[10px] font-bold text-muted-foreground">
                          ${(dealsByStage[stage.id]?.reduce((sum: number, d: any) => sum + (d.value || 0), 0) || 0).toLocaleString()}
                       </div>
                    </div>

                    <div className="flex flex-col gap-4 min-h-[600px] p-2 rounded-b-[32px] bg-muted/10 border border-t-0 border-border/30 overflow-y-auto max-h-[calc(100vh-350px)] scrollbar-hide">
                       {(dealsByStage[stage.id] || []).map((deal: any) => (
                         <div 
                           key={deal.id} 
                           onClick={() => setSelectedDeal(deal)}
                           className="group bg-card p-5 rounded-2xl border border-border/60 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer relative overflow-hidden"
                         >
                            <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: stage.color }} />
                            
                            <div className="flex justify-between items-start mb-3">
                               <p className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter opacity-60">
                                  {deal.contact ? `${deal.contact.firstName} ${deal.contact.lastName}` : 'Direct Lead'}
                               </p>
                               <button className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-muted rounded-lg transition-all">
                                  <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                               </button>
                            </div>

                            <h4 className="font-black text-sm text-foreground mb-4 group-hover:text-primary transition-colors line-clamp-1">{deal.title}</h4>

                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-1.5">
                                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                                  <span className="text-sm font-black text-foreground tracking-tight">{deal.value?.toLocaleString()}</span>
                               </div>
                               <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground">
                                     <Clock className="w-3 h-3" />
                                     {deal.closeDate ? new Date(deal.closeDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Set Date'}
                                  </div>
                                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-[8px] font-black text-primary border border-primary/20">
                                     {getStaffName(deal.assignedTo).charAt(0)}
                                  </div>
                               </div>
                            </div>

                            {/* Quick Activity Indicators */}
                            <div className="mt-4 pt-4 border-t border-border/40 flex items-center gap-3">
                               <div className="flex gap-1.5">
                                  <div className="w-6 h-6 rounded-md bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors" title="Log Call">
                                     <Phone className="w-3 h-3" />
                                  </div>
                                  <div className="w-6 h-6 rounded-md bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors" title="Send Email">
                                     <Mail className="w-3 h-3" />
                                  </div>
                               </div>
                               <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500/40" style={{ width: '40%' }} />
                                </div>
                            </div>
                         </div>
                       ))}

                       {dealsByStage[stage.id]?.length === 0 && (
                          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-20 border-2 border-dashed border-border rounded-3xl m-2">
                             <Layers className="w-8 h-8 mb-2" />
                             <p className="text-[10px] font-black uppercase tracking-widest">Stage Empty</p>
                          </div>
                       )}
                    </div>
                  </div>
                ))}
              </div>
           </div>

           {/* Activity Sidebar */}
           <aside className="space-y-8">
              <div className="bg-card border border-border rounded-[40px] p-8 premium-shadow relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                 
                 <div className="flex items-center justify-between mb-8 relative z-10">
                    <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                       <ActivityIcon className="w-4 h-4 text-primary" />
                       Recent Activity
                    </h3>
                    <Link href="/dashboard/activities" className="text-[9px] font-black text-primary hover:underline">VIEW ALL</Link>
                 </div>

                 <div className="space-y-6 relative z-10">
                    {activities.map(activity => (
                      <div key={activity.id} className="flex gap-4 group cursor-pointer">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            activity.type === 'CALL' ? 'bg-indigo-500/10 text-indigo-500' : 
                            activity.type === 'EMAIL' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                         }`}>
                            {activity.type === 'CALL' ? <Phone className="w-4 h-4" /> : 
                             activity.type === 'EMAIL' ? <Mail className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-foreground group-hover:text-primary transition-colors">{activity.subject}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{activity.contact}</p>
                            <div className="flex items-center gap-2 mt-2">
                               <span className="text-[9px] font-bold text-muted-foreground uppercase">{activity.time}</span>
                               <div className="w-1 h-1 rounded-full bg-border" />
                               <span className={`text-[8px] font-black uppercase tracking-tighter ${
                                  activity.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'
                               }`}>{activity.status}</span>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>

                 <button className="w-full mt-10 py-4 bg-muted/50 border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all">
                    Load More Activity
                 </button>
              </div>

              <div className="bg-primary p-8 rounded-[40px] text-white shadow-2xl shadow-primary/30 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                 <h4 className="text-xs font-black uppercase tracking-widest mb-4 opacity-70">Sales Goal</h4>
                 <div className="flex items-end justify-between mb-4">
                    <p className="text-3xl font-black">$48,200</p>
                    <p className="text-xs font-bold opacity-60">of $100k</p>
                 </div>
                 <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-6">
                    <div className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]" style={{ width: '48%' }} />
                 </div>
                 <p className="text-[10px] font-bold opacity-70 leading-relaxed">You are 12% ahead of your quarterly target. Great job!</p>
              </div>
           </aside>

        </div>
      </div>

      {/* Add Deal Modal */}
      <PremiumModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="New Sales Opportunity"
        subtitle="Initiate a new deal in the active pipeline"
      >
         <form onSubmit={handleAdd} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Opportunity Title</label>
                  <input required value={newDeal.title} onChange={e => setNewDeal({...newDeal, title: e.target.value})} className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold" placeholder="e.g. Q4 Server Refresh" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Estimated Value</label>
                  <div className="relative">
                     <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                     <input required type="number" value={newDeal.value || ''} onChange={e => setNewDeal({...newDeal, value: Number(e.target.value)})} className="w-full bg-muted/50 border border-border rounded-2xl pl-12 pr-6 py-4 text-sm font-bold" placeholder="0.00" />
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Pipeline Stage</label>
                  <select 
                    required 
                    value={newDeal.stageId} 
                    onChange={e => setNewDeal({...newDeal, stageId: e.target.value})}
                    className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold appearance-none cursor-pointer"
                  >
                     <option value="">Select Stage</option>
                     {activePipeline?.stages?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Expected Close</label>
                  <input type="date" value={newDeal.closeDate} onChange={e => setNewDeal({...newDeal, closeDate: e.target.value})} className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold" />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Description</label>
               <RichTextEditor value={newDeal.description} onChange={(html: string) => setNewDeal({...newDeal, description: html})} />
            </div>

            <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:opacity-90 transition-all">
               Initialize Deal
            </button>
         </form>
      </PremiumModal>

      {/* Deal Detail Sidebar (Slide-over) */}
      {selectedDeal && (
         <div className="fixed inset-0 z-[200] flex justify-end">
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedDeal(null)} />
            <div className="relative w-full max-w-xl bg-card border-l border-border shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col h-full">
               
               <div className="flex justify-between items-center p-8 border-b border-border/50 bg-muted/20">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <Briefcase className="w-5 h-5" />
                     </div>
                     <div>
                        <h2 className="text-xl font-black text-foreground">Deal Context</h2>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">ID: {selectedDeal.id?.slice(0, 8)}</p>
                     </div>
                  </div>
                  <button onClick={() => setSelectedDeal(null)} className="p-3 hover:bg-muted rounded-xl transition-all">
                     <X className="w-6 h-6" />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-10 space-y-12 scrollbar-hide">
                  <header>
                     <h3 className="text-3xl font-black text-foreground leading-tight mb-6">{selectedDeal.title}</h3>
                     <div className="flex flex-wrap gap-3">
                        <span className="px-4 py-2 bg-indigo-500/10 text-indigo-500 rounded-xl text-[10px] font-black uppercase border border-indigo-500/20">{selectedDeal.stage?.name}</span>
                        <span className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-[10px] font-black uppercase border border-emerald-500/20">${selectedDeal.value?.toLocaleString()}</span>
                        <span className="px-4 py-2 bg-muted rounded-xl text-[10px] font-black uppercase border border-border">{selectedDeal.status}</span>
                     </div>
                  </header>

                  <section className="space-y-4">
                     <h4 className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <User className="w-3.5 h-3.5" /> Stakeholder
                     </h4>
                     <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center text-lg font-black text-primary shadow-sm">
                           {selectedDeal.contact?.firstName?.[0] || 'L'}
                        </div>
                        <div>
                           <p className="text-sm font-black text-foreground">{selectedDeal.contact ? `${selectedDeal.contact.firstName} ${selectedDeal.contact.lastName}` : 'Unlinked Contact'}</p>
                           <p className="text-[10px] text-muted-foreground font-medium">{selectedDeal.contact?.email || 'No email provided'}</p>
                        </div>
                     </div>
                  </section>

                  <section className="space-y-4">
                     <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Description</h4>
                     <div className="p-8 rounded-[32px] bg-muted/10 border border-border/30 text-sm leading-relaxed prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: selectedDeal.description || '<p class="italic text-muted-foreground">No description provided for this deal.</p>' }} />
                  </section>

                  <section className="space-y-6">
                     <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <ActivityIcon className="w-4 h-4" /> Deal Timeline
                     </h4>
                     <div className="space-y-8 pl-4 border-l-2 border-border/50 ml-2">
                        <TimelineItem 
                          title="Deal Created" 
                          desc="Initial opportunity identified and logged." 
                          time={new Date(selectedDeal.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} 
                          icon={CheckCircle2} 
                          active 
                        />
                        <TimelineItem 
                          title="Last Activity" 
                          desc="System synchronization and update." 
                          time={new Date(selectedDeal.updatedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} 
                          icon={ArrowRight} 
                          active 
                        />
                        {selectedDeal.status === 'WON' && (
                          <TimelineItem title="Deal Won" desc="Transaction successfully completed." time={selectedDeal.wonAt ? new Date(selectedDeal.wonAt).toLocaleDateString() : 'Just now'} icon={Target} active />
                        )}
                     </div>
                  </section>
               </div>

               <div className="p-8 border-t border-border/50 bg-muted/20 flex gap-4">
                  <button onClick={() => { setSelectedDeal(null); setEditDeal(selectedDeal); setShowEditModal(true); }} className="flex-1 py-4 bg-foreground text-background rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all">Edit Context</button>
                  <button onClick={() => handleDelete(selectedDeal.id)} className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all">
                     <Trash2 className="w-5 h-5" />
                  </button>
               </div>
            </div>
         </div>
       )}
       {/* Edit Deal Modal */}
      <PremiumModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Update Opportunity"
        subtitle="Refine deal details and progress through stages"
      >
         {editDeal && (
           <form onSubmit={handleUpdate} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Opportunity Title</label>
                    <input required value={editDeal.title} onChange={e => setEditDeal({...editDeal, title: e.target.value})} className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Value</label>
                    <div className="relative">
                       <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                       <input required type="number" value={editDeal.value || ''} onChange={e => setEditDeal({...editDeal, value: Number(e.target.value)})} className="w-full bg-muted/50 border border-border rounded-2xl pl-12 pr-6 py-4 text-sm font-bold" />
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Current Stage</label>
                    <select 
                      required 
                      value={editDeal.stageId} 
                      onChange={e => setEditDeal({...editDeal, stageId: e.target.value})}
                      className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold appearance-none cursor-pointer"
                    >
                       {activePipeline?.stages?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Assigned To</label>
                    <select 
                      value={editDeal.assignedTo} 
                      onChange={e => setEditDeal({...editDeal, assignedTo: e.target.value})}
                      className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold appearance-none cursor-pointer"
                    >
                       <option value="">Select Staff</option>
                       {staffList.map((s: any) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                    </select>
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Status</label>
                 <div className="flex gap-4">
                    {['OPEN', 'WON', 'LOST'].map(status => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setEditDeal({...editDeal, status})}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black border transition-all ${
                          editDeal.status === status 
                          ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                          : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                 </div>
              </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Context & Strategic Value</label>
                     <RichTextEditor value={editDeal.description || ''} onChange={html => setEditDeal({...editDeal, description: html})} mentions={staffList} />
                  </div>

              <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:opacity-90 transition-all">
                 Save Changes
              </button>
           </form>
         )}
      </PremiumModal>
    </DashboardLayout>
  );
}

function StatCard({ label, value, icon: Icon, color, trend }: any) {
  const colors: any = {
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    indigo: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  };

  return (
    <div className="bg-card p-8 rounded-[40px] border border-border/60 premium-shadow group hover:border-primary/30 transition-all">
       <div className="flex justify-between items-start mb-6">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color]}`}>
             <Icon className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black text-muted-foreground uppercase opacity-50">{trend}</span>
       </div>
       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
       <p className="text-3xl font-black text-foreground tracking-tight">{value}</p>
    </div>
  );
}

function TimelineItem({ title, desc, time, icon: Icon, active }: any) {
  return (
    <div className="relative">
       <div className={`absolute -left-[25px] top-0 w-4 h-4 rounded-full border-2 border-card flex items-center justify-center ${active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-muted text-muted-foreground'}`}>
          <Icon className="w-2 h-2" />
       </div>
       <div className="space-y-1">
          <div className="flex items-center justify-between">
             <p className="text-xs font-black text-foreground">{title}</p>
             <span className="text-[9px] font-bold text-muted-foreground uppercase">{time}</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">{desc}</p>
       </div>
    </div>
  );
}

function Trash2(props: any) {
   return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;
}
