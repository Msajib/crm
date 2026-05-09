'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Plus, 
  Settings, 
  Trash2, 
  GripVertical, 
  CheckCircle2, 
  AlertCircle,
  Save,
  GitBranch,
  Layers,
  ChevronRight,
  RefreshCw,
  MoreVertical,
  Target
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';
import PremiumModal from '@/components/PremiumModal';

// DnD Kit Imports
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

// Sortable Item Component
function SortableStageItem({ stage, idx, onRemove, onChange, isNew }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: stage.tempId || stage.id || `stage-${idx}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border ${isDragging ? 'border-primary shadow-xl bg-card' : 'border-border'} group transition-shadow`}
    >
       <div 
         {...attributes} 
         {...listeners} 
         className="cursor-grab text-muted-foreground/30 hover:text-primary transition-colors p-1"
       >
          <GripVertical className="w-4 h-4" />
       </div>
       <div className="w-8 h-8 rounded-lg shrink-0" style={{ backgroundColor: stage.color }} />
       <input 
         className="flex-1 bg-transparent border-none text-sm font-bold focus:ring-0 p-0" 
         value={stage.name} 
         onChange={e => onChange(idx, 'name', e.target.value)}
         placeholder="Stage Name"
       />
       <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-xl border border-border">
          <input 
            type="number" 
            className="w-8 bg-transparent border-none text-[10px] font-black p-0 text-center" 
            value={stage.probability}
            onChange={e => onChange(idx, 'probability', parseInt(e.target.value) || 0)}
          />
          <span className="text-[9px] font-bold text-muted-foreground">%</span>
       </div>
       <button 
         type="button" 
         onClick={() => onRemove(idx)} 
         className="p-2 text-muted-foreground hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
       >
          <Trash2 className="w-4 h-4" />
       </button>
    </div>
  );
}

export default function PipelineSettings() {
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState<any>(null);
  
  // Sensors for DnD
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [newPipeline, setNewPipeline] = useState({
    name: '',
    isDefault: false,
    stages: [
      { tempId: '1', name: 'Discovery', order: 1, color: '#6366f1', probability: 10 },
      { tempId: '2', name: 'Qualified', order: 2, color: '#f59e0b', probability: 30 },
      { tempId: '3', name: 'Proposal', order: 3, color: '#3b82f6', probability: 60 },
      { tempId: '4', name: 'Negotiation', order: 4, color: '#8b5cf6', probability: 80 },
      { tempId: '5', name: 'Won', order: 5, color: '#10b981', probability: 100 },
    ] as any[]
  });

  const fetchPipelines = async () => {
    try {
      setLoading(true);
      const data = await api.get('/pipelines');
      setPipelines(data || []);
    } catch (err) {
      toast.error('Failed to load pipelines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelines();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Re-assign orders based on current position
      const stagesWithOrder = newPipeline.stages.map((s, i) => ({ ...s, order: i + 1 }));
      await api.post('/pipelines', { ...newPipeline, stages: stagesWithOrder });
      toast.success('Pipeline created successfully');
      setShowAddModal(false);
      fetchPipelines();
      setNewPipeline({
        name: '',
        isDefault: false,
        stages: [
          { tempId: '1', name: 'Discovery', order: 1, color: '#6366f1', probability: 10 },
          { tempId: '2', name: 'Qualified', order: 2, color: '#f59e0b', probability: 30 },
          { tempId: '3', name: 'Proposal', order: 3, color: '#3b82f6', probability: 60 },
          { tempId: '4', name: 'Negotiation', order: 4, color: '#8b5cf6', probability: 80 },
          { tempId: '5', name: 'Won', order: 5, color: '#10b981', probability: 100 },
        ] as any[]
      });
    } catch (err) {
      toast.error('Failed to create pipeline');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPipeline) return;
    try {
      // Re-assign orders based on current position
      const stagesWithOrder = selectedPipeline.stages.map((s: any, i: number) => ({ ...s, order: i + 1 }));
      await api.put(`/pipelines/${selectedPipeline.id}`, { ...selectedPipeline, stages: stagesWithOrder });
      toast.success('Pipeline updated');
      setShowEditModal(false);
      fetchPipelines();
    } catch (err) {
      toast.error('Failed to update pipeline');
    }
  };

  const handleToggleDefault = async (pipeline: any) => {
    if (pipeline.isDefault) return;
    try {
      await api.put(`/pipelines/${pipeline.id}`, { isDefault: true });
      toast.success(`${pipeline.name} is now the active pipeline`);
      fetchPipelines();
    } catch (err) {
      toast.error('Failed to update pipeline');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? All associated deals will lose their pipeline context.')) return;
    try {
      await api.delete(`/pipelines/${id}`);
      toast.success('Pipeline removed');
      fetchPipelines();
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const handleDragEnd = (event: DragEndEvent, isNew: boolean) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    if (isNew) {
      setNewPipeline((prev) => {
        const oldIndex = prev.stages.findIndex((s: any) => (s.tempId || s.id) === active.id);
        const newIndex = prev.stages.findIndex((s: any) => (s.tempId || s.id) === over.id);
        return { ...prev, stages: arrayMove(prev.stages, oldIndex, newIndex) };
      });
    } else {
      setSelectedPipeline((prev: any) => {
        const oldIndex = prev.stages.findIndex((s: any) => (s.tempId || s.id) === active.id);
        const newIndex = prev.stages.findIndex((s: any) => (s.tempId || s.id) === over.id);
        return { ...prev, stages: arrayMove(prev.stages, oldIndex, newIndex) };
      });
    }
  };

  const addStage = (isNew: boolean) => {
    const newStage = { tempId: Math.random().toString(), name: 'New Stage', order: 0, color: '#94a3b8', probability: 50 };
    if (isNew) {
      setNewPipeline({ ...newPipeline, stages: [...newPipeline.stages, newStage] });
    } else {
      setSelectedPipeline({ ...selectedPipeline, stages: [...selectedPipeline.stages, newStage] });
    }
  };

  const removeStage = (index: number, isNew: boolean) => {
    if (isNew) {
      const updated = [...newPipeline.stages];
      updated.splice(index, 1);
      setNewPipeline({ ...newPipeline, stages: updated });
    } else {
      const updated = [...selectedPipeline.stages];
      updated.splice(index, 1);
      setSelectedPipeline({ ...selectedPipeline, stages: updated });
    }
  };

  const updateStage = (index: number, field: string, value: any, isNew: boolean) => {
    if (isNew) {
      const updated = [...newPipeline.stages];
      (updated[index] as any)[field] = value;
      setNewPipeline({ ...newPipeline, stages: updated });
    } else {
      const updated = [...selectedPipeline.stages];
      updated[index][field] = value;
      setSelectedPipeline({ ...selectedPipeline, stages: updated });
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-10 pb-20">
        <header className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center">
                  <GitBranch className="w-6 h-6" />
               </div>
               <h1 className="text-2xl font-black text-foreground tracking-tight">Revenue Pipelines</h1>
            </div>
            <p className="text-muted-foreground text-sm font-medium">Define and manage your sales stages and conversion workflows.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-white px-8 py-4 rounded-[20px] font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> Initialize Pipeline
          </button>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
             <RefreshCw className="w-10 h-10 animate-spin text-primary" />
             <p className="text-xs font-black uppercase tracking-widest">Synchronizing Nodes...</p>
          </div>
        ) : pipelines.length === 0 ? (
          <div className="glass-premium p-20 rounded-[50px] border border-dashed border-border flex flex-col items-center justify-center text-center space-y-6">
             <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                <Target className="w-10 h-10" />
             </div>
             <div>
                <h3 className="text-base font-black text-foreground">No Pipelines Detected</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto mt-2">You must create at least one pipeline to start tracking deals and managing your revenue flow.</p>
             </div>
             <button 
               onClick={() => setShowAddModal(true)}
               className="bg-foreground text-background px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all"
             >
                Create First Pipeline
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pipelines.map((pipeline) => (
              <div 
                key={pipeline.id} 
                className={`glass-premium p-8 rounded-[40px] border-2 transition-all group relative overflow-hidden ${pipeline.isDefault ? 'border-primary bg-primary/5 shadow-2xl shadow-primary/10' : 'border-border bg-background/50 hover:border-border/80'}`}
              >
                {pipeline.isDefault && (
                  <div className="absolute top-0 right-0 bg-primary text-white px-6 py-2 rounded-bl-3xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                     <CheckCircle2 className="w-3.5 h-3.5" /> Active Pipeline
                  </div>
                )}
                
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-black text-foreground">{pipeline.name}</h3>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">{pipeline.stages?.length || 0} Stages • {pipeline._count?.deals || 0} Active Deals</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setSelectedPipeline({...pipeline}); setShowEditModal(true); }}
                        className="p-2 hover:bg-muted rounded-xl transition-all text-muted-foreground hover:text-foreground border border-border"
                      >
                         <Settings className="w-4 h-4" />
                      </button>
                      {!pipeline.isDefault && (
                        <button 
                          onClick={() => handleDelete(pipeline.id)}
                          className="p-2 hover:bg-rose-500/10 rounded-xl transition-all text-muted-foreground hover:text-rose-500 border border-border"
                        >
                           <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    {pipeline.stages?.map((stage: any, idx: number) => (
                      <React.Fragment key={stage.id}>
                        <div 
                          className="w-3 h-3 rounded-full shrink-0 shadow-sm" 
                          style={{ backgroundColor: stage.color }}
                          title={stage.name}
                        />
                        {idx < pipeline.stages.length - 1 && <div className="h-px flex-1 bg-border/50" />}
                      </React.Fragment>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-border/50">
                    {!pipeline.isDefault ? (
                      <button 
                        onClick={() => handleToggleDefault(pipeline)}
                        className="w-full py-4 bg-muted hover:bg-primary hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-border/50"
                      >
                        Activate Pipeline
                      </button>
                    ) : (
                      <div className="text-center py-4 text-[9px] font-black text-primary uppercase tracking-[0.2em] italic">
                        Current Primary Workspace
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Modal */}
        <PremiumModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Initialize Pipeline"
          subtitle="Configure your sales stages and probabilities"
          maxWidth="max-w-2xl"
        >
           <form onSubmit={handleCreate} className="space-y-10">
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Pipeline Architecture Name</label>
                 <input 
                   required 
                   value={newPipeline.name} 
                   onChange={e => setNewPipeline({...newPipeline, name: e.target.value})}
                   className="w-full bg-muted border-2 border-border/50 rounded-3xl px-8 py-5 text-sm font-bold focus:border-primary transition-all outline-none"
                   placeholder="e.g. Standard B2B Sales"
                 />
              </div>

              <div className="space-y-6">
                 <div className="flex justify-between items-center px-2">
                    <h4 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                       <Layers className="w-4 h-4 text-primary" /> Stage Configuration
                    </h4>
                    <button type="button" onClick={() => addStage(true)} className="text-[10px] font-black text-primary hover:underline">+ ADD STAGE</button>
                 </div>
                 
                 <DndContext 
                   sensors={sensors} 
                   collisionDetection={closestCenter} 
                   onDragEnd={(e) => handleDragEnd(e, true)}
                   modifiers={[restrictToVerticalAxis]}
                 >
                   <SortableContext 
                     items={newPipeline.stages.map((s: any) => s.tempId || s.id)} 
                     strategy={verticalListSortingStrategy}
                   >
                     <div className="space-y-3">
                        {newPipeline.stages.map((stage, idx) => (
                          <SortableStageItem 
                            key={stage.tempId || stage.id} 
                            stage={stage} 
                            idx={idx} 
                            isNew={true}
                            onRemove={() => removeStage(idx, true)}
                            onChange={(i: number, f: string, v: any) => updateStage(i, f, v, true)}
                          />
                        ))}
                     </div>
                   </SortableContext>
                 </DndContext>
              </div>

              <div className="flex items-center gap-3 p-6 bg-primary/5 border border-primary/10 rounded-3xl">
                 <input 
                   type="checkbox" 
                   id="isDefault" 
                   checked={newPipeline.isDefault} 
                   onChange={e => setNewPipeline({...newPipeline, isDefault: e.target.checked})}
                   className="w-5 h-5 rounded-lg border-2 border-primary/20 text-primary focus:ring-primary/20"
                 />
                 <label htmlFor="isDefault" className="text-xs font-black text-foreground cursor-pointer uppercase tracking-tight">Set as default active pipeline</label>
              </div>

              <button type="submit" className="w-full py-6 bg-primary text-white rounded-[30px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                 <Save className="w-5 h-5" /> Deploy Pipeline Infrastructure
              </button>
           </form>
        </PremiumModal>

        {/* Edit Modal */}
        <PremiumModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Configure Pipeline"
          subtitle="Update stages and metadata"
          maxWidth="max-w-2xl"
        >
           {selectedPipeline && (
             <form onSubmit={handleUpdate} className="space-y-10">
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Pipeline Name</label>
                   <input 
                     required 
                     value={selectedPipeline.name} 
                     onChange={e => setSelectedPipeline({...selectedPipeline, name: e.target.value})}
                     className="w-full bg-muted border-2 border-border/50 rounded-3xl px-8 py-5 text-sm font-bold focus:border-primary transition-all outline-none"
                   />
                </div>

                <div className="space-y-6">
                   <div className="flex justify-between items-center px-2">
                      <h4 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                         <Layers className="w-4 h-4 text-primary" /> Stage Configuration
                      </h4>
                      <button type="button" onClick={() => addStage(false)} className="text-[10px] font-black text-primary hover:underline">+ ADD STAGE</button>
                   </div>
                   
                   <DndContext 
                     sensors={sensors} 
                     collisionDetection={closestCenter} 
                     onDragEnd={(e) => handleDragEnd(e, false)}
                     modifiers={[restrictToVerticalAxis]}
                   >
                     <SortableContext 
                       items={selectedPipeline.stages.map((s: any) => s.tempId || s.id)} 
                       strategy={verticalListSortingStrategy}
                     >
                       <div className="space-y-3">
                          {selectedPipeline.stages?.map((stage: any, idx: number) => (
                            <SortableStageItem 
                              key={stage.tempId || stage.id} 
                              stage={stage} 
                              idx={idx} 
                              isNew={false}
                              onRemove={() => removeStage(idx, false)}
                              onChange={(i: number, f: string, v: any) => updateStage(i, f, v, false)}
                            />
                          ))}
                       </div>
                     </SortableContext>
                   </DndContext>
                </div>

                <button type="submit" className="w-full py-6 bg-foreground text-background rounded-[30px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                   <Save className="w-5 h-5" /> Save Configuration Changes
                </button>
             </form>
           )}
        </PremiumModal>
      </div>
    </DashboardLayout>
  );
}
