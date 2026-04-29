'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Zap, 
  Plus, 
  Play, 
  Pause, 
  Trash2, 
  Edit, 
  Clock, 
  Mail, 
  Tag, 
  UserPlus, 
  ChevronRight,
  Filter,
  Activity,
  Workflow
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ModuleGuard from '@/components/ModuleGuard';

const INITIAL_AUTOMATIONS = [
  { id: 1, name: 'Lead Welcome Sequence', trigger: 'New Contact', actions: 3, status: 'ACTIVE', lastRun: '2 mins ago' },
  { id: 2, name: 'Deal Follow-up', trigger: 'Stage Change', actions: 2, status: 'PAUSED', lastRun: '1 day ago' },
  { id: 3, name: 'High-Value Score Alert', trigger: 'Score Threshold', actions: 1, status: 'ACTIVE', lastRun: '15 mins ago' },
];

export default function AutomationEnginePage() {
  return (
    <ModuleGuard moduleId="automations">
      <AutomationContent />
    </ModuleGuard>
  );
}

function AutomationContent() {
  const [automations, setAutomations] = useState(INITIAL_AUTOMATIONS);
  const [showWizard, setShowWizard] = useState(false);

  const toggleStatus = (id: number) => {
    setAutomations(automations.map(a => a.id === id ? { ...a, status: a.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } : a));
    toast.success('Automation status updated');
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-10 pb-20">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-foreground mb-2 text-gradient flex items-center">
              <Workflow className="w-8 h-8 mr-3 text-primary" />
              Automation Engine
            </h1>
            <p className="text-muted-foreground text-sm">Create multi-step visual workflows to automate lead scoring, communication, and CRM updates.</p>
          </div>
          <button 
            onClick={() => setShowWizard(true)}
            className="bg-primary text-white px-8 py-4 rounded-2xl font-black flex items-center space-x-3 hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Create Workflow</span>
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           {/* Automations List */}
           <div className="lg:col-span-3 space-y-6">
              {automations.map(auto => (
                 <div key={auto.id} className="glass-premium p-8 rounded-[40px] border border-border flex items-center justify-between group hover:border-primary/20 transition-all premium-shadow bg-background/50">
                    <div className="flex items-center space-x-8">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                          auto.status === 'ACTIVE' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-muted text-muted-foreground border border-border'
                       }`}>
                          <Zap className="w-6 h-6" />
                       </div>
                       <div>
                          <h3 className="text-lg font-black text-foreground">{auto.name}</h3>
                          <div className="flex items-center space-x-4 mt-2">
                             <span className="flex items-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                <Activity className="w-3 h-3 mr-1.5 text-primary" /> Trigger: {auto.trigger}
                             </span>
                             <span className="flex items-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                <Workflow className="w-3 h-3 mr-1.5 text-indigo-500" /> {auto.actions} Actions
                             </span>
                             <span className="flex items-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                <Clock className="w-3 h-3 mr-1.5 text-amber-500" /> Run {auto.lastRun}
                             </span>
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center space-x-3">
                       <button 
                          onClick={() => toggleStatus(auto.id)}
                          className={`p-3 rounded-xl border transition-all ${
                             auto.status === 'ACTIVE' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          }`}
                       >
                          {auto.status === 'ACTIVE' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                       </button>
                       <button className="p-3 bg-muted text-muted-foreground border border-border rounded-xl hover:text-foreground transition-all">
                          <Edit className="w-4 h-4" />
                       </button>
                       <button className="p-3 bg-muted text-muted-foreground border border-border rounded-xl hover:text-red-500 transition-all">
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
              ))}
           </div>

           {/* Stats & Tips */}
           <aside className="space-y-8">
              <div className="glass-premium p-8 rounded-[40px] border border-border premium-shadow bg-primary/5">
                 <h3 className="font-black text-sm uppercase tracking-widest text-foreground mb-6">Automation Health</h3>
                 <div className="space-y-6">
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-bold text-muted-foreground">Successful Runs</span>
                       <span className="text-sm font-black text-emerald-500">2,410</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-bold text-muted-foreground">Failures</span>
                       <span className="text-sm font-black text-red-500">12</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
                       <div className="h-full bg-primary" style={{ width: '98%' }}></div>
                    </div>
                 </div>
              </div>

              <div className="glass-premium p-8 rounded-[40px] border border-border premium-shadow">
                 <h3 className="font-black text-sm uppercase tracking-widest text-foreground mb-6">Popular Triggers</h3>
                 <div className="space-y-4">
                    <TriggerItem icon={UserPlus} label="New Contact" count={42} />
                    <TriggerItem icon={Activity} label="Stage Change" count={28} />
                    <TriggerItem icon={Clock} label="Scheduled" count={15} />
                 </div>
              </div>
           </aside>
        </div>
      </div>

      {/* Visual Wizard Modal (Mock) */}
      {showWizard && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-50 flex flex-col p-10 animate-in fade-in duration-300">
           <header className="flex justify-between items-center mb-12">
              <div className="flex items-center space-x-4">
                 <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center">
                    <Zap className="w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-foreground">Visual Workflow Wizard</h2>
                    <p className="text-xs text-muted-foreground">Building: New Lead Follow-up</p>
                 </div>
              </div>
              <button onClick={() => setShowWizard(false)} className="p-4 hover:bg-muted rounded-2xl transition-all">
                 <Trash2 className="w-6 h-6 text-muted-foreground" />
              </button>
           </header>

           <div className="flex-1 flex flex-col items-center justify-center space-y-12">
              <WizardStep icon={Activity} label="Trigger" value="When a New Contact is added" />
              <div className="w-px h-12 bg-border border-dashed border"></div>
              <WizardStep icon={Mail} label="Action 1" value="Send 'Welcome Package' Email" />
              <div className="w-px h-12 bg-border border-dashed border"></div>
              <WizardStep icon={Tag} label="Action 2" value="Add Tag 'Hot Lead'" />
              <button className="flex items-center space-x-2 px-6 py-4 bg-muted border border-border rounded-2xl text-xs font-black uppercase tracking-widest text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all">
                 <Plus className="w-4 h-4" />
                 <span>Add Next Step</span>
              </button>
           </div>

           <footer className="flex justify-end space-x-4 mt-12">
              <button onClick={() => setShowWizard(false)} className="px-10 py-5 bg-muted text-muted-foreground rounded-2xl font-black uppercase tracking-widest text-xs">Cancel</button>
              <button onClick={() => { setShowWizard(false); toast.success('Automation Saved!'); }} className="px-10 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/30">Save & Activate</button>
           </footer>
        </div>
      )}
    </DashboardLayout>
  );
}

function TriggerItem({ icon: Icon, label, count }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border">
       <div className="flex items-center space-x-3">
          <Icon className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-foreground">{label}</span>
       </div>
       <span className="text-[10px] font-black text-muted-foreground">{count} workflows</span>
    </div>
  );
}

function WizardStep({ icon: Icon, label, value }: any) {
  return (
    <div className="w-full max-w-lg glass-premium p-8 rounded-[32px] border border-border premium-shadow flex items-center justify-between group hover:border-primary/50 transition-all cursor-pointer">
       <div className="flex items-center space-x-6">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
             <Icon className="w-5 h-5" />
          </div>
          <div>
             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</p>
             <p className="text-sm font-black text-foreground">{value}</p>
          </div>
       </div>
       <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
    </div>
  );
}
