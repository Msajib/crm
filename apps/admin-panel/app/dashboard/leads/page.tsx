'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Target, 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  Zap, 
  CheckCircle2, 
  TrendingUp,
  ChevronRight,
  Loader2,
  X,
  Plus,
  Briefcase
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';
import ModuleGuard from '@/components/ModuleGuard';

export default function LeadsPage() {
  return (
    <ModuleGuard moduleId="contacts">
      <LeadsContent />
    </ModuleGuard>
  );
}

function LeadsContent() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [conversionData, setConversionData] = useState({
    pipelineId: '',
    stageId: '',
    title: '',
    value: 0
  });

  useEffect(() => {
    fetchLeads();
    fetchPipelines();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const data = await api.get('/contacts?status=LEAD');
      setLeads(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchPipelines = async () => {
    try {
      const data = await api.get('/pipelines');
      setPipelines(data || []);
    } catch (err) {
      console.error('Failed to fetch pipelines');
    }
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversionData.pipelineId || !conversionData.stageId) {
      return toast.error('Please select pipeline and stage');
    }

    try {
      await api.post(`/contacts/${selectedLead.id}/convert`, {
        ...conversionData,
        title: conversionData.title || `Deal with ${selectedLead.firstName}`
      });
      toast.success('Lead converted successfully!');
      setShowConvertModal(false);
      fetchLeads();
    } catch (err) {
      toast.error('Conversion failed');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/contacts/${id}`, { status });
      toast.success(`Status updated to ${status}`);
      fetchLeads();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-foreground tracking-tight">Leads Management</h1>
            <p className="text-muted-foreground mt-2 font-medium">Track and convert potential opportunities into customers.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="glass-premium px-6 py-3 rounded-2xl border border-border flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-black text-foreground">Conversion: 12.5%</span>
            </div>
            <button className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
              <Plus className="w-5 h-5" />
              <span>Import Leads</span>
            </button>
          </div>
        </header>

        {/* Filters & Stats Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 flex items-center space-x-4 bg-muted/30 p-2 rounded-3xl border border-border">
            <div className="flex-1 relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                className="w-full bg-transparent border-none focus:ring-0 px-14 py-4 text-sm font-bold text-foreground" 
                placeholder="Search leads by name, email or source..."
              />
            </div>
            <button className="px-6 py-4 bg-background border border-border rounded-2xl flex items-center space-x-2 text-sm font-bold hover:bg-muted transition-all">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
          <div className="glass-premium p-2 rounded-3xl border border-border flex items-center justify-between px-8">
             <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Leads</p>
                <p className="text-2xl font-black text-foreground">{leads.length}</p>
             </div>
             <Target className="w-8 h-8 text-primary/30" />
          </div>
        </div>

        {/* Leads Table */}
        <div className="glass-premium rounded-[40px] border border-border overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/10">
                <th className="text-left px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Lead Name</th>
                <th className="text-left px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Contact Info</th>
                <th className="text-left px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Source</th>
                <th className="text-left px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Score</th>
                <th className="text-right px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">Fetching lead intelligence...</p>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                    <Target className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-foreground">No Active Leads</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto">Import or capture leads from your social channels and website.</p>
                  </td>
                </tr>
              ) : leads.map((lead) => (
                <tr key={lead.id} className="border-b border-border/50 hover:bg-muted/5 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg">
                        {lead.firstName[0]}{lead.lastName[0]}
                      </div>
                      <div>
                        <p className="font-black text-foreground tracking-tight">{lead.firstName} {lead.lastName}</p>
                        <p className="text-xs text-muted-foreground font-medium italic">{lead.jobTitle || 'Lead'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="flex items-center text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                        <Mail className="w-3 h-3 mr-2" /> {lead.email}
                      </div>
                      <div className="flex items-center text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                        <Phone className="w-3 h-3 mr-2" /> {lead.phone || 'No phone'}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-4 py-1.5 rounded-full bg-muted text-[10px] font-black uppercase tracking-widest border border-border">
                      {lead.source || 'Direct'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2">
                       <Zap className={`w-4 h-4 ${lead.customFields?.score > 70 ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
                       <span className="text-sm font-black text-foreground">{lead.customFields?.score || '--'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end space-x-3">
                      <button 
                        onClick={() => { setSelectedLead(lead); setShowConvertModal(true); }}
                        className="bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center"
                      >
                         <Briefcase className="w-3 h-3 mr-2" />
                         Convert
                      </button>
                      <button className="p-2 hover:bg-muted rounded-xl transition-all"><MoreVertical className="w-5 h-5 text-muted-foreground" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conversion Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-[300] flex items-center justify-center p-4">
           <div className="glass-premium w-full max-w-2xl rounded-[50px] border border-border p-12 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-10">
                 <div>
                    <h2 className="text-3xl font-black text-foreground tracking-tight">Convert to Opportunity</h2>
                    <p className="text-sm text-muted-foreground mt-2 font-medium italic">Create a deal in your sales pipeline for {selectedLead?.firstName}.</p>
                 </div>
                 <button onClick={() => setShowConvertModal(false)} className="p-4 hover:bg-muted rounded-2xl transition-all text-muted-foreground"><X className="w-6 h-6" /></button>
              </div>

              <form onSubmit={handleConvert} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2">Deal Title</label>
                    <input 
                      required 
                      className="w-full bg-muted/30 border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" 
                      placeholder="e.g. Website Development Project"
                      value={conversionData.title}
                      onChange={(e) => setConversionData({ ...conversionData, title: e.target.value })}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2">Pipeline</label>
                       <select 
                         required 
                         className="w-full bg-muted/30 border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:outline-none appearance-none"
                         onChange={(e) => setConversionData({ ...conversionData, pipelineId: e.target.value, stageId: '' })}
                       >
                          <option value="">Select Pipeline...</option>
                          {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2">Initial Stage</label>
                       <select 
                         required 
                         disabled={!conversionData.pipelineId}
                         className="w-full bg-muted/30 border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:outline-none appearance-none disabled:opacity-50"
                         onChange={(e) => setConversionData({ ...conversionData, stageId: e.target.value })}
                       >
                          <option value="">Select Stage...</option>
                          {pipelines.find(p => p.id === conversionData.pipelineId)?.stages.map((s: any) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                       </select>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2">Estimated Value</label>
                    <div className="relative">
                       <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-muted-foreground">$</span>
                       <input 
                         type="number" 
                         className="w-full bg-muted/30 border border-border rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-foreground focus:outline-none" 
                         placeholder="0.00"
                         value={conversionData.value}
                         onChange={(e) => setConversionData({ ...conversionData, value: parseFloat(e.target.value) })}
                       />
                    </div>
                 </div>

                 <div className="flex space-x-4 pt-6">
                    <button type="button" onClick={() => setShowConvertModal(false)} className="flex-1 py-5 bg-muted text-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-muted/80 transition-all">Discard</button>
                    <button type="submit" className="flex-[2] py-5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-emerald-500/30 hover:opacity-90 transition-all flex items-center justify-center space-x-2">
                       <CheckCircle2 className="w-4 h-4" />
                       <span>Confirm Conversion</span>
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </DashboardLayout>
  );
}
