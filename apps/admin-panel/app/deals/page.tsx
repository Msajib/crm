'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Plus, 
  Search, 
  DollarSign,
  Calendar,
  Layers,
  X,
  Building2,
  Briefcase
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ActionDropdown from '@/components/ActionDropdown';
import RichTextEditor from '@/components/RichTextEditor';
import ModuleGuard from '@/components/ModuleGuard';
import PremiumModal from '@/components/PremiumModal';


export default function DealsPage() {
  return (
    <ModuleGuard moduleId="deals">
      <DealsContent />
    </ModuleGuard>
  );
}

function DealsContent() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [newDeal, setNewDeal] = useState({ 
    title: '', 
    contactId: '', 
    pipelineId: '', 
    stageId: '', 
    value: 0, 
    description: '',
    closeDate: '' 
  });
  const [editDeal, setEditDeal] = useState<any>(null);
  const [pipelines, setPipelines] = useState<any[]>([]);

  const fetchDeals = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/deals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDeals(data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const fetchPipelines = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/pipelines', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPipelines(data || []);
        if (data.length > 0 && !newDeal.pipelineId) {
          setNewDeal(prev => ({ 
            ...prev, 
            pipelineId: data[0].id,
            stageId: data[0].stages?.[0]?.id || ''
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load pipelines');
    }
  };

  React.useEffect(() => {
    fetchDeals();
    fetchPipelines();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Clean up payload
      const payload = {
        ...newDeal,
        contactId: newDeal.contactId || undefined,
        value: Number(newDeal.value) || 0,
        closeDate: newDeal.closeDate || undefined,
      };

      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        toast.success('Opportunity created!');
        setShowAddModal(false);
        setNewDeal({ 
          title: '', 
          contactId: '', 
          pipelineId: pipelines[0]?.id || '', 
          stageId: pipelines[0]?.stages?.[0]?.id || '', 
          value: 0, 
          description: '',
          closeDate: ''
        });
        fetchDeals();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Creation failed');
      }
    } catch (err) {
      toast.error('Creation failed');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/deals/${editDeal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editDeal),
      });
      if (res.ok) {
        toast.success('Deal updated!');
        setShowEditModal(false);
        fetchDeals();
      }
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this deal?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/deals/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Deal removed');
        fetchDeals();
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const dealsByStage = deals.reduce((acc: any, deal: any) => {
    const stageId = deal.stageId;
    if (!acc[stageId]) acc[stageId] = [];
    acc[stageId].push(deal);
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-10 pb-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-foreground mb-2 flex items-center">
               <Briefcase className="w-8 h-8 mr-4 text-primary" />
               Sales Pipeline
            </h1>
            <p className="text-muted-foreground text-sm font-medium">Visualize your deals and track revenue across the sales funnel.</p>
          </div>
          <button 
            onClick={() => {
              fetchPipelines(); // Refresh pipelines when opening
              setShowAddModal(true);
            }}
            className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/25 hover:opacity-90 transition-all flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            NEW OPPORTUNITY
          </button>
        </header>

        <div className="flex space-x-6 overflow-x-auto pb-10 custom-scrollbar">
          {(pipelines[0]?.stages || []).map((stage: any) => (
            <div key={stage.id} className="w-80 shrink-0">
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center space-x-3">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }}></div>
                   <h3 className="text-xs font-black text-foreground uppercase tracking-widest">{stage.name}</h3>
                   <span className="px-2 py-0.5 bg-muted rounded-full text-[10px] font-bold text-muted-foreground">
                     {dealsByStage[stage.id]?.length || 0}
                   </span>
                </div>
              </div>
              
              <div className="space-y-4 min-h-[500px]">
                {(dealsByStage[stage.id] || []).map((deal: any) => (
                  <div 
                    key={deal.id} 
                    className="glass-card group p-6 rounded-[32px] border border-border/40 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-grab active:cursor-grabbing bg-background/40"
                    onClick={() => setSelectedDeal(deal)}
                  >
                    <div className="flex justify-between items-start mb-4">
                       <span className="text-[10px] font-black px-2 py-1 bg-primary/10 text-primary rounded-lg uppercase">
                          {deal.pipeline?.name}
                       </span>
                       <ActionDropdown 
                          onDelete={() => handleDelete(deal.id)}
                          onEdit={() => { setEditDeal(deal); setShowEditModal(true); }}
                          onView={() => setSelectedDeal(deal)}
                       />
                    </div>
                    
                    <h4 className="text-sm font-black text-foreground mb-1 group-hover:text-primary pr-8">{deal.title}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground mb-6 uppercase tracking-widest">
                       {deal.contact ? `${deal.contact.firstName} ${deal.contact.lastName}` : 'Direct Deal'}
                    </p>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-border">
                      <div className="flex items-center text-xs text-emerald-500 font-black">
                        <DollarSign className="w-3 h-3 mr-1" />
                        {deal.value?.toLocaleString() || '0'}
                      </div>
                      <div className="flex items-center text-[10px] text-gray-500 font-black uppercase">
                        <Calendar className="w-3 h-3 mr-1 text-primary" />
                        {deal.closeDate ? new Date(deal.closeDate).toLocaleDateString() : 'No date'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {pipelines.length === 0 && !loading && (
             <div className="flex-1 py-20 text-center bg-muted/20 rounded-[40px] border-2 border-dashed border-border mx-10">
                <Layers className="w-10 h-10 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-sm font-black text-foreground uppercase tracking-widest">No Pipelines Configured</p>
                <p className="text-xs text-muted-foreground mt-1">Please ensure the database is seeded or create a pipeline in settings.</p>
             </div>
          )}
        </div>
      </div>


      <PremiumModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create Opportunity"
        subtitle={`Pipeline: ${pipelines[0]?.name || 'Default'}`}
        footer={(
          <button type="submit" form="add-deal-form" disabled={!newDeal.pipelineId || !newDeal.stageId} className="w-full py-5 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/25 hover:opacity-90 transition-all disabled:opacity-50">CREATE OPPORTUNITY</button>
        )}
      >
        <form id="add-deal-form" onSubmit={handleAdd} className="space-y-8">
           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Deal Title</label>
                 <input required value={newDeal.title} onChange={e => setNewDeal({...newDeal, title: e.target.value})} type="text" className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/30" placeholder="e.g. Enterprise CRM License" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Value ($)</label>
                 <input 
                   required 
                   value={newDeal.value === 0 ? '' : newDeal.value} 
                   onChange={e => {
                     const val = e.target.value === '' ? 0 : Number(e.target.value);
                     setNewDeal({...newDeal, value: val});
                   }} 
                   type="number" 
                   className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" 
                 />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Pipeline</label>
                 <select 
                   className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all appearance-none cursor-pointer"
                   value={newDeal.pipelineId}
                   onChange={e => {
                     const p = pipelines.find(x => x.id === e.target.value);
                     setNewDeal({...newDeal, pipelineId: e.target.value, stageId: p?.stages?.[0]?.id || ''});
                   }}
                 >
                   {pipelines.length > 0 ? pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>) : <option>No pipelines found</option>}
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Initial Stage</label>
                 <select 
                   className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all appearance-none cursor-pointer"
                   value={newDeal.stageId}
                   onChange={e => setNewDeal({...newDeal, stageId: e.target.value})}
                 >
                   {pipelines.find(p => p.id === newDeal.pipelineId)?.stages?.map((s: any) => (
                     <option key={s.id} value={s.id}>{s.name}</option>
                   )) || <option>No stages found</option>}
                 </select>
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Description & Notes</label>
              <div className="rounded-3xl border border-border overflow-hidden bg-background/50">
                 <RichTextEditor 
                   content={newDeal.description} 
                   onChange={(html) => setNewDeal({...newDeal, description: html})} 
                 />
              </div>
           </div>
        </form>
      </PremiumModal>

      {selectedDeal && (
         <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-background border-l border-border shadow-2xl z-[60] animate-in slide-in-from-right duration-300 p-10 overflow-y-auto">
            <div className="flex justify-between items-center mb-10">
               <h2 className="text-xl font-black text-foreground">Deal Details</h2>
               <button onClick={() => setSelectedDeal(null)} className="p-2 hover:bg-muted rounded-xl transition-all text-muted-foreground"><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-8">
               <div>
                  <h3 className="text-2xl font-black text-foreground">{selectedDeal.title}</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">Status: {selectedDeal.status}</p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 rounded-3xl bg-muted/30 border border-border">
                     <DollarSign className="w-4 h-4 text-emerald-500 mb-2" />
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Value</p>
                     <p className="text-lg font-black text-foreground">${selectedDeal.value?.toLocaleString() || '0'}</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-muted/30 border border-border">
                     <Layers className="w-4 h-4 text-primary mb-2" />
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Stage</p>
                     <p className="text-lg font-black text-foreground">{selectedDeal.stage?.name || 'N/A'}</p>
                  </div>
               </div>
               <div>
                  <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">Description</h4>
                  <div className="text-sm text-foreground prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: selectedDeal.description || 'No description provided.' }} />
               </div>
            </div>
         </div>
      )}
    </DashboardLayout>
  );
}
