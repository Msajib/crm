'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Users, 
  Search, 
  ExternalLink, 
  Shield, 
  Ban, 
  CheckCircle,
  Clock,
  ArrowUpRight,
  Plus,
  ShieldAlert,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ActionDropdown from '@/components/ActionDropdown';

const MOCK_TENANTS = [
  { id: 1, name: 'Acme Corp', slug: 'acme', email: 'admin@acme.com', plan: 'ENTERPRISE', status: 'ACTIVE', joined: '2026-01-15' },
  { id: 2, name: 'TechFlow', slug: 'techflow', email: 'hello@techflow.io', plan: 'PRO', status: 'ACTIVE', joined: '2026-02-10' },
  { id: 3, name: 'Global Net', slug: 'global', email: 'info@global.net', plan: 'BASIC', status: 'PENDING', joined: '2026-04-20' },
  { id: 4, name: 'Vertex Co', slug: 'vertex', email: 'sajib@vertex.co', plan: 'PRO', status: 'SUSPENDED', joined: '2026-03-05' },
];

export default function SuperAdminTenants() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tenants, setTenants] = useState(MOCK_TENANTS);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAddModal(false);
    toast.success('Tenant organization created successfully!');
  };

  const loginAsAdmin = (slug: string) => {
    toast.loading(`Authenticating as ${slug} administrator...`, { duration: 2000 });
    setTimeout(() => {
      localStorage.setItem('tenant_slug', slug);
      localStorage.setItem('role', 'ADMIN');
      toast.success(`Successfully switched to ${slug} context!`);
      // Redirect to dashboard with new tenant context
      window.location.href = '/dashboard';
    }, 2000);
  };

  const handleStatusChange = (id: number, status: string) => {
    setTenants(tenants.map(t => t.id === id ? { ...t, status } : t));
    toast.success(`Tenant status updated to ${status}`);
  };

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-10">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-foreground mb-2 text-gradient">Tenant Ecosystem</h1>
            <p className="text-muted-foreground">Global oversight of all organizations, billing status, and system health.</p>
          </div>
          <div className="flex items-center space-x-3">
             <div className="bg-primary/10 px-6 py-3 rounded-2xl border border-primary/20">
                <span className="text-xs font-black text-primary uppercase tracking-widest">Total Tenants: {tenants.length}</span>
             </div>
             <button onClick={() => setShowAddModal(true)} className="bg-primary text-white p-4 rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-95">
                <Plus className="w-6 h-6" />
             </button>
          </div>
        </header>

        {/* Search & Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
           <div className="md:col-span-2 relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search by organization, slug or email..." 
                className="w-full bg-muted border border-border rounded-3xl pl-14 pr-6 py-5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex space-x-3">
              <div className="flex-1 glass-premium p-4 rounded-3xl border border-border flex items-center justify-between">
                 <span className="text-[10px] font-black text-muted-foreground uppercase">Active</span>
                 <span className="text-sm font-black text-emerald-500">{tenants.filter(t => t.status === 'ACTIVE').length}</span>
              </div>
              <div className="flex-1 glass-premium p-4 rounded-3xl border border-border flex items-center justify-between">
                 <span className="text-[10px] font-black text-muted-foreground uppercase">Alerts</span>
                 <span className="text-sm font-black text-red-500">1</span>
              </div>
           </div>
        </div>

        {/* Table Content */}
        <div className="glass-premium rounded-[48px] border border-border overflow-visible premium-shadow bg-background/50">
          <table className="w-full text-left">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Organization Details</th>
                <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Subscription</th>
                <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-primary/5 transition-all group">
                  <td className="px-10 py-8">
                    <div className="flex items-center space-x-6">
                      <div className="w-14 h-14 rounded-[20px] bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/10 flex items-center justify-center text-indigo-500 font-black text-xl shadow-inner">
                        {tenant.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-base font-black text-foreground">{tenant.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">@{tenant.slug} • {tenant.email}</p>
                        <div className="flex items-center space-x-2 mt-2">
                           <Clock className="w-3 h-3 text-muted-foreground" />
                           <span className="text-[10px] font-bold text-muted-foreground uppercase">Joined {tenant.joined}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border ${
                      tenant.plan === 'ENTERPRISE' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      tenant.plan === 'PRO' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
                      'bg-gray-500/10 text-gray-500 border-gray-500/20'
                    }`}>
                      {tenant.plan}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center justify-center space-x-2">
                      {tenant.status === 'ACTIVE' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> :
                       tenant.status === 'PENDING' ? <Clock className="w-4 h-4 text-amber-500" /> :
                       <Ban className="w-4 h-4 text-red-500" />}
                      <span className={`text-[10px] font-black uppercase ${
                        tenant.status === 'ACTIVE' ? 'text-emerald-500' :
                        tenant.status === 'PENDING' ? 'text-amber-500' :
                        'text-red-500'
                      }`}>{tenant.status}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex justify-end items-center space-x-3">
                      <button 
                        onClick={() => loginAsAdmin(tenant.slug)}
                        className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl hover:bg-indigo-500 hover:text-white transition-all group/btn shadow-sm"
                        title="Login as Admin"
                      >
                        <ArrowUpRight className="w-5 h-5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                      </button>
                      <ActionDropdown 
                         onView={() => toast.info(`Viewing details for ${tenant.name}`)}
                         onEdit={() => handleStatusChange(tenant.id, tenant.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
                         onDelete={() => toast.error(`Deletion of ${tenant.name} restricted.`)}
                         onCopy={() => loginAsAdmin(tenant.slug)} // Use Copy as secondary login trigger
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="glass-premium w-full max-w-2xl rounded-[40px] border border-border p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-2xl font-black text-foreground">Create New Tenant</h2>
               <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-muted rounded-xl transition-all text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddTenant} className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Organization Name</label>
                    <input required type="text" className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Acme Corp" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Slug / Subdomain</label>
                    <input required type="text" className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="acme" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Admin Email</label>
                    <input required type="email" className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="admin@acme.com" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Phone Number</label>
                    <input required type="tel" className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="+1..." />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Company Size</label>
                    <select required className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground">
                      <option value="">Select Size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201+">201+ employees</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Industry</label>
                    <select required className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground">
                      <option value="">Select Industry</option>
                      <option value="Tech">Technology</option>
                      <option value="Finance">Finance</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Retail">Retail</option>
                      <option value="Other">Other</option>
                    </select>
                 </div>
               </div>
               <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/25 hover:opacity-90 transition-all mt-4">Provision Workspace</button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
