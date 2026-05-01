'use client';

import React, { useState, useEffect } from 'react';
import PremiumModal from './PremiumModal';
import { Target, DollarSign, Layers, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';

interface ConvertDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: any;
  onSuccess?: () => void;
}

export default function ConvertDealModal({ isOpen, onClose, contact, onSuccess }: ConvertDealModalProps) {
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: `${contact.firstName} ${contact.lastName} Opportunity`,
    pipelineId: '',
    stageId: '',
    value: 0,
    description: `Opportunity created from contact: ${contact.firstName} ${contact.lastName}`
  });

  useEffect(() => {
    if (isOpen) {
      fetchPipelines();
    }
  }, [isOpen]);

  const fetchPipelines = async () => {
    try {
      const data = await api.get('/pipelines');
      setPipelines(data || []);
      if (data.length > 0) {
        const defaultP = data.find((p: any) => p.isDefault) || data[0];
        setFormData(prev => ({
          ...prev,
          pipelineId: defaultP.id,
          stageId: defaultP.stages?.[0]?.id || ''
        }));
      }
    } catch (err) {
      console.error('Failed to load pipelines');
    }
  };

  const handlePipelineChange = (pipelineId: string) => {
    const pipeline = pipelines.find(p => p.id === pipelineId);
    setFormData(prev => ({
      ...prev,
      pipelineId,
      stageId: pipeline?.stages?.[0]?.id || ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/deals', {
        ...formData,
        contactId: contact.id,
        value: Number(formData.value)
      });
      toast.success('Converted to Deal successfully!');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error('Conversion failed');
    } finally {
      setLoading(false);
    }
  };

  const selectedPipeline = pipelines.find(p => p.id === formData.pipelineId);

  if (pipelines.length === 0) {
    return (
      <PremiumModal
        isOpen={isOpen}
        onClose={onClose}
        title="Pipeline Required"
        subtitle="Action Restricted"
        maxWidth="max-w-md"
      >
        <div className="text-center space-y-6 py-6">
           <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto">
              <Target className="w-8 h-8" />
           </div>
           <div className="space-y-2">
              <p className="text-sm font-bold text-foreground">No pipelines detected in your workspace.</p>
              <p className="text-xs text-muted-foreground leading-relaxed">You must create at least one pipeline in System Settings before you can convert contacts to deals.</p>
           </div>
           <button 
             onClick={onClose}
             className="w-full py-4 bg-muted text-foreground rounded-2xl font-black text-[10px] uppercase tracking-widest border border-border"
           >
              I Understand
           </button>
        </div>
      </PremiumModal>
    );
  }

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      title="Convert to Deal"
      subtitle={`Creating opportunity for ${contact.firstName}`}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Deal Title</label>
          <div className="relative">
             <Target className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
             <input 
               required 
               value={formData.title} 
               onChange={e => setFormData({...formData, title: e.target.value})} 
               className="w-full bg-muted/50 border border-border rounded-2xl px-12 py-4 text-sm font-bold" 
               placeholder="e.g. Q4 Enterprise License" 
             />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Pipeline</label>
              <div className="relative">
                 <select 
                   required 
                   value={formData.pipelineId} 
                   onChange={e => handlePipelineChange(e.target.value)}
                   className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold appearance-none cursor-pointer"
                 >
                    {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                 </select>
                 <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rotate-90 pointer-events-none" />
              </div>
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Initial Stage</label>
              <div className="relative">
                 <select 
                   required 
                   value={formData.stageId} 
                   onChange={e => setFormData({...formData, stageId: e.target.value})}
                   className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold appearance-none cursor-pointer"
                 >
                    {selectedPipeline?.stages?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                 </select>
                 <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rotate-90 pointer-events-none" />
              </div>
           </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Deal Value</label>
          <div className="relative">
             <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
             <input 
               type="number" 
               value={formData.value || ''} 
               onChange={e => setFormData({...formData, value: Number(e.target.value)})} 
               className="w-full bg-muted/50 border border-border rounded-2xl px-12 py-4 text-sm font-black" 
               placeholder="0.00" 
             />
          </div>
        </div>

        <div className="space-y-2">
           <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Description</label>
           <textarea 
             value={formData.description} 
             onChange={e => setFormData({...formData, description: e.target.value})}
             className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 text-sm font-medium min-h-[100px] resize-none"
           />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center space-x-2"
        >
          {loading ? 'Processing...' : (
            <>
              <Layers className="w-4 h-4" />
              <span>Convert to Deal</span>
            </>
          )}
        </button>
      </form>
    </PremiumModal>
  );
}
