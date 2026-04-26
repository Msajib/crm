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

const INITIAL_DEALS = [
  { id: 1, title: 'Enterprise CRM Setup', company: 'Acme Corp', value: '12,000', stage: 'NEGOTIATION', date: '2026-05-12' },
  { id: 2, title: 'Mobile App Revamp', company: 'TechFlow', value: '8,500', stage: 'PROPOSAL', date: '2026-05-15' },
  { id: 3, title: 'Cloud Infrastructure', company: 'Global Net', value: '25,000', stage: 'CLOSED WON', date: '2026-04-20' },
  { id: 4, title: 'Security Audit', company: 'Vertex Co', value: '4,200', stage: 'DISCOVERY', date: '2026-05-01' },
];

export default function DealsPage() {
  const [deals, setDeals] = useState(INITIAL_DEALS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeal, setNewDeal] = useState({ title: '', company: '', value: '', stage: 'DISCOVERY', date: '' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Date.now();
    setDeals([{ ...newDeal, id: Number(id), value: `$${newDeal.value}` }, ...deals]);
    setShowAddModal(false);
    setNewDeal({ title: '', company: '', value: '', stage: 'DISCOVERY', date: '' });
    toast.success('Opportunity created!');
  };

  const handleDelete = (id: number) => {
    if (confirm('Delete this deal?')) {
      setDeals(deals.filter(d => d.id !== id));
      toast.success('Deal removed');
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-10">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-foreground mb-2">Sales Pipeline</h1>
            <p className="text-muted-foreground text-sm">Manage high-value opportunities and revenue flow.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-white px-8 py-4 rounded-2xl font-black flex items-center space-x-3 hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>New Opportunity</span>
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {['DISCOVERY', 'PROPOSAL', 'NEGOTIATION', 'CLOSED'].map((stage) => (
            <div key={stage} className="space-y-6">
              <div className="flex justify-between items-center px-6 py-3 bg-muted border border-border rounded-2xl">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stage}</span>
                <span className="text-[10px] font-black bg-primary/10 px-2 py-0.5 rounded-lg text-primary">
                    {deals.filter(d => d.stage.includes(stage)).length}
                </span>
              </div>
              
              <div className="space-y-4 min-h-[500px]">
                {deals.filter(d => d.stage.includes(stage)).map((deal) => (
                  <div key={deal.id} className="glass-premium p-6 rounded-3xl border border-border hover:border-primary/30 transition-all group relative premium-shadow">
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                       <ActionDropdown 
                          onDelete={() => handleDelete(deal.id)}
                          onEdit={() => toast.info('Edit mode coming soon')}
                          onView={() => toast.info(`Viewing ${deal.title}`)}
                       />
                    </div>
                    
                    <h4 className="text-sm font-black text-foreground mb-1 group-hover:text-primary pr-8">{deal.title}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground mb-6 uppercase tracking-widest">{deal.company}</p>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-border">
                      <div className="flex items-center text-xs text-emerald-500 font-black">
                        <DollarSign className="w-3 h-3 mr-1" />
                        {deal.value}
                      </div>
                      <div className="flex items-center text-[10px] text-gray-500 font-black uppercase">
                        <Calendar className="w-3 h-3 mr-1 text-primary" />
                        {deal.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Deal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-premium w-full max-w-lg rounded-[48px] border border-border p-12 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-10">
               <div>
                  <h2 className="text-2xl font-black text-foreground">Create Opportunity</h2>
                  <p className="text-xs text-muted-foreground mt-1">Add a new deal to your sales pipeline.</p>
               </div>
               <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-muted rounded-2xl transition-all text-muted-foreground"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Deal Title</label>
                  <div className="relative">
                     <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                     <input required value={newDeal.title} onChange={e => setNewDeal({...newDeal, title: e.target.value})} type="text" className="w-full bg-muted border border-border rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="e.g. Enterprise Software License" />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Company Name</label>
                  <div className="relative">
                     <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                     <input required value={newDeal.company} onChange={e => setNewDeal({...newDeal, company: e.target.value})} type="text" className="w-full bg-muted border border-border rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="e.g. Acme Corp" />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Deal Value ($)</label>
                     <input required value={newDeal.value} onChange={e => setNewDeal({...newDeal, value: e.target.value})} type="number" className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="e.g. 5000" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Closing Date</label>
                     <input required value={newDeal.date} onChange={e => setNewDeal({...newDeal, date: e.target.value})} type="date" className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
               </div>
               <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black text-sm shadow-2xl shadow-primary/30 hover:opacity-90 transition-all mt-6 active:scale-95">Create Opportunity</button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
