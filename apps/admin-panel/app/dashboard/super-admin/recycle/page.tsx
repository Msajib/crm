'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Trash2, 
  RotateCcw, 
  ArrowLeft,
  Search,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function RecycleBinPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [recycled, setRecycled] = useState<any[]>([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState<any>(null);

  useEffect(() => {
    const loaded = JSON.parse(localStorage.getItem('crm_recycle_bin') || '[]');
    setRecycled(loaded);
  }, []);

  const handleRestore = (tenant: any) => {
    // 1. Remove from recycle bin
    const newRecycled = recycled.filter(t => t.id !== tenant.id);
    localStorage.setItem('crm_recycle_bin', JSON.stringify(newRecycled));
    setRecycled(newRecycled);

    // 2. Add back to active tenants
    const active = JSON.parse(localStorage.getItem('mock_tenants_db') || '[]');
    localStorage.setItem('mock_tenants_db', JSON.stringify([...active, tenant]));
    
    toast.success(`${tenant.name} restored successfully!`);
    // Note: In a real app, this would refresh the list or trigger a re-validation
  };

  const handlePermanentDelete = () => {
    if (!showConfirmDelete) return;

    const newRecycled = recycled.filter(t => t.id !== showConfirmDelete.id);
    localStorage.setItem('crm_recycle_bin', JSON.stringify(newRecycled));
    setRecycled(newRecycled);
    setShowConfirmDelete(null);
    toast.success(`Permanently deleted ${showConfirmDelete.name}`, { icon: '🔥' });
  };

  const filtered = recycled.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-10">
        <header className="flex justify-between items-end">
          <div>
            <div className="flex items-center space-x-4 mb-4">
               <Link href="/dashboard/super-admin/tenants" className="p-2 hover:bg-muted rounded-xl transition-all text-muted-foreground group">
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
               </Link>
               <h1 className="text-3xl font-black text-foreground text-gradient">Recycle Bin</h1>
            </div>
            <p className="text-muted-foreground">Items in the recycle bin can be restored to the active ecosystem or permanently deleted.</p>
          </div>
          <div className="bg-red-500/10 px-6 py-3 rounded-2xl border border-red-500/20">
             <span className="text-xs font-black text-red-500 uppercase tracking-widest">Total Deleted: {recycled.length}</span>
          </div>
        </header>

        <div className="relative">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
           <input 
             type="text" 
             placeholder="Search deleted organizations..." 
             className="w-full bg-muted border border-border rounded-3xl pl-14 pr-6 py-5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>

        <div className="glass-premium rounded-[48px] border border-border overflow-hidden premium-shadow bg-background/50">
           <table className="w-full text-left">
             <thead className="bg-muted/50 border-b border-border">
               <tr>
                 <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Organization</th>
                 <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Deleted Date</th>
                 <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-border">
               {filtered.length === 0 ? (
                 <tr>
                   <td colSpan={3} className="px-10 py-20 text-center">
                      <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-4">
                         <Trash2 className="w-10 h-10 text-muted-foreground/30" />
                      </div>
                      <p className="text-muted-foreground font-bold">Recycle bin is empty</p>
                   </td>
                 </tr>
               ) : (
                 filtered.map((tenant) => (
                   <tr key={tenant.id} className="hover:bg-red-500/5 transition-all group">
                     <td className="px-10 py-8">
                       <div className="flex items-center space-x-6">
                         <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground font-black text-lg">
                           {tenant.name.charAt(0)}
                         </div>
                         <div>
                           <p className="text-base font-black text-foreground">{tenant.name}</p>
                           <p className="text-xs text-muted-foreground mt-0.5">@{tenant.slug}</p>
                         </div>
                       </div>
                     </td>
                     <td className="px-10 py-8 text-center text-sm font-bold text-muted-foreground">
                        {tenant.deletedAt ? new Date(tenant.deletedAt).toLocaleString() : 'N/A'}
                     </td>
                     <td className="px-10 py-8 text-right">
                       <div className="flex justify-end items-center space-x-3">
                          <button 
                            onClick={() => handleRestore(tenant)}
                            className="flex items-center space-x-2 px-5 py-3 bg-emerald-500/10 text-emerald-500 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all font-bold text-xs"
                          >
                             <RotateCcw className="w-4 h-4" />
                             <span>Restore</span>
                          </button>
                          <button 
                            onClick={() => setShowConfirmDelete(tenant)}
                            className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            title="Permanent Delete"
                          >
                             <Trash2 className="w-5 h-5" />
                          </button>
                       </div>
                     </td>
                   </tr>
                 ))
               )}
             </tbody>
           </table>
        </div>
      </div>

      {showConfirmDelete && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
           <div className="glass-premium w-full max-w-md rounded-[40px] border border-border p-10 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
              <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                 <AlertCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black mb-2 text-red-500">Permanent Delete?</h2>
              <p className="text-muted-foreground text-sm mb-8">This action is irreversible. All data for <strong>{showConfirmDelete.name}</strong> will be wiped from the system.</p>
              <div className="flex flex-col space-y-3">
                 <button onClick={handlePermanentDelete} className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-red-500/25 hover:opacity-90 transition-all">Destroy Permanently</button>
                 <button onClick={() => setShowConfirmDelete(null)} className="w-full py-4 bg-muted text-foreground rounded-2xl font-bold text-sm hover:bg-border transition-all">Keep Record</button>
              </div>
           </div>
        </div>
      )}
    </DashboardLayout>
  );
}
