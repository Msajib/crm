'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  X,
  Trash2,
  Edit,
  Eye,
  Copy,
  History,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ActionDropdown from '@/components/ActionDropdown';

const MOCK_TENANTS = [
  { id: 1, name: 'Acme Corp', slug: 'acme', email: 'admin@acme.com', plan: 'ENTERPRISE', status: 'ACTIVE', joined: '2026-01-15', phone: '+123456789', industry: 'Tech', size: '51-200' },
  { id: 2, name: 'TechFlow', slug: 'techflow', email: 'hello@techflow.io', plan: 'PRO', status: 'ACTIVE', joined: '2026-02-10', phone: '+987654321', industry: 'SaaS', size: '11-50' },
  { id: 3, name: 'Global Net', slug: 'global', email: 'info@global.net', plan: 'BASIC', status: 'PENDING', joined: '2026-04-20', phone: '+112233445', industry: 'Telecom', size: '201+' },
  { id: 4, name: 'Vertex Co', slug: 'vertex', email: 'sajib@vertex.co', plan: 'PRO', status: 'SUSPENDED', joined: '2026-03-05', phone: '+554433221', industry: 'Finance', size: '1-10' },
];

export default function SuperAdminTenants() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tenants, setTenants] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState<any>(null);
  const [showLoginConfirm, setShowLoginConfirm] = useState<any>(null);

  useEffect(() => {
    const loaded = JSON.parse(localStorage.getItem('mock_tenants_db') || '[]');
    if (loaded.length > 0) {
      setTenants([...MOCK_TENANTS, ...loaded]);
    } else {
      setTenants(MOCK_TENANTS);
    }
  }, []);

  const saveToDB = (updatedList: any[]) => {
    // We only save the "new" ones or the full list excluding defaults to local storage
    const customOnes = updatedList.filter(t => !MOCK_TENANTS.find(m => m.id === t.id));
    localStorage.setItem('mock_tenants_db', JSON.stringify(customOnes));
    setTenants(updatedList);
  };

  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newTenant = {
      id: Date.now(),
      name: formData.get('name'),
      slug: formData.get('slug'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      size: formData.get('size'),
      industry: formData.get('industry'),
      plan: 'BASIC',
      status: 'ACTIVE',
      joined: new Date().toISOString().split('T')[0]
    };
    saveToDB([...tenants, newTenant]);
    setShowAddModal(false);
    toast.success('Tenant organization created successfully!');
  };

  const handleUpdateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const updated = tenants.map(t => t.id === showEditModal.id ? {
      ...t,
      name: formData.get('name'),
      slug: formData.get('slug'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      size: formData.get('size'),
      industry: formData.get('industry'),
    } : t);
    saveToDB(updated);
    setShowEditModal(null);
    toast.success('Tenant details updated!');
  };

  const handleDuplicate = (tenant: any) => {
    const newTenant = {
      ...tenant,
      id: Date.now(),
      name: `${tenant.name} (Copy)`,
      slug: `${tenant.slug}-copy`,
      joined: new Date().toISOString().split('T')[0]
    };
    saveToDB([...tenants, newTenant]);
    toast.success(`Duplicated ${tenant.name}`);
  };

  const handleSoftDelete = (tenant: any) => {
    const recycled = JSON.parse(localStorage.getItem('crm_recycle_bin') || '[]');
    localStorage.setItem('crm_recycle_bin', JSON.stringify([...recycled, { ...tenant, deletedAt: new Date().toISOString() }]));
    
    const updated = tenants.filter(t => t.id !== tenant.id);
    saveToDB(updated);
    toast.success(`${tenant.name} moved to recycle bin`);
  };

  const performLogin = (tenant: any) => {
    toast.loading(`Authenticating as ${tenant.slug} administrator...`, { duration: 2000 });
    setTimeout(() => {
      // Save original context for "Switch Back"
      localStorage.setItem('original_user', localStorage.getItem('user') || '');
      localStorage.setItem('original_role', localStorage.getItem('role') || 'SUPER_ADMIN');
      localStorage.setItem('original_tenant_slug', localStorage.getItem('tenant_slug') || 'system');
      
      localStorage.setItem('isImpersonating', 'true');
      localStorage.setItem('tenant_slug', tenant.slug);
      localStorage.setItem('tenant_id', tenant.id);
      localStorage.setItem('role', 'ADMIN');
      localStorage.setItem('user', JSON.stringify({ firstName: 'Admin', lastName: tenant.slug, email: `admin@${tenant.slug}.com` }));
      
      toast.success(`Successfully switched to ${tenant.slug} context!`);
      window.location.href = '/dashboard';
    }, 2000);
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
             <Link href="/dashboard/super-admin/recycle" className="flex items-center space-x-2 bg-muted hover:bg-accent px-6 py-3 rounded-2xl border border-border transition-all">
                <Trash2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-black uppercase tracking-widest">Recycle Bin</span>
             </Link>
             <div className="bg-primary/10 px-6 py-3 rounded-2xl border border-primary/20">
                <span className="text-xs font-black text-primary uppercase tracking-widest">Total: {tenants.length}</span>
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
                        onClick={() => {
                          const updated = tenants.map(t => t.id === tenant.id ? { ...t, status: t.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : t);
                          saveToDB(updated);
                          toast.success(`Tenant ${tenant.status === 'ACTIVE' ? 'suspended' : 'activated'} successfully`);
                        }}
                        className={`p-3 rounded-2xl transition-all shadow-sm ${
                          tenant.status === 'ACTIVE'
                            ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'
                            : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                        }`}
                        title={tenant.status === 'ACTIVE' ? "Suspend Tenant" : "Activate Tenant"}
                      >
                        {tenant.status === 'ACTIVE' ? <Ban className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                      </button>
                      <button 
                        onClick={() => setShowLoginConfirm(tenant)}
                        className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl hover:bg-indigo-500 hover:text-white transition-all group/btn shadow-sm"
                        title="Login as Admin"
                      >
                        <ArrowUpRight className="w-5 h-5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                      </button>
                      <ActionDropdown 
                         onView={() => setShowViewModal(tenant)}
                         onEdit={() => setShowEditModal(tenant)}
                         onDelete={() => handleSoftDelete(tenant)}
                         onCopy={() => handleDuplicate(tenant)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <Modal title="Create New Tenant" onClose={() => setShowAddModal(false)}>
           <form onSubmit={handleAddTenant} className="space-y-6">
              <TenantFormFields />
              <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/25 hover:opacity-90 transition-all mt-4">Provision Workspace</button>
           </form>
        </Modal>
      )}

      {showEditModal && (
        <Modal title={`Edit ${showEditModal.name}`} onClose={() => setShowEditModal(null)}>
           <form onSubmit={handleUpdateTenant} className="space-y-6">
              <TenantFormFields defaultValues={showEditModal} />
              <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/25 hover:opacity-90 transition-all mt-4">Save Changes</button>
           </form>
        </Modal>
      )}

      {showViewModal && (
        <Modal title="Tenant Details" onClose={() => setShowViewModal(null)}>
           <div className="space-y-8">
              <div className="flex items-center space-x-6 p-6 bg-muted/50 rounded-[32px] border border-border">
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary text-3xl font-black">{showViewModal.name.charAt(0)}</div>
                <div>
                   <h3 className="text-xl font-black">{showViewModal.name}</h3>
                   <p className="text-muted-foreground text-sm">@{showViewModal.slug}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <DetailItem label="Email Address" value={showViewModal.email} />
                 <DetailItem label="Phone Number" value={showViewModal.phone || 'N/A'} />
                 <DetailItem label="Industry" value={showViewModal.industry || 'N/A'} />
                 <DetailItem label="Organization Size" value={showViewModal.size || 'N/A'} />
                 <DetailItem label="Current Plan" value={showViewModal.plan} isBadge />
                 <DetailItem label="Status" value={showViewModal.status} isBadge />
                 <DetailItem label="Joined On" value={showViewModal.joined} />
              </div>
              <button onClick={() => setShowViewModal(null)} className="w-full py-4 bg-muted text-foreground rounded-2xl font-bold text-sm hover:bg-border transition-all">Close Details</button>
           </div>
        </Modal>
      )}

      {showLoginConfirm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
           <div className="glass-premium w-full max-w-md rounded-[40px] border border-border p-10 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
              <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                 <AlertTriangle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black mb-2">Switch Context?</h2>
              <p className="text-muted-foreground text-sm mb-8">You are about to login as the administrator of <strong>{showLoginConfirm.name}</strong>. Your current session will be temporarily switched.</p>
              <div className="flex flex-col space-y-3">
                 <button onClick={() => performLogin(showLoginConfirm)} className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/25 hover:opacity-90 transition-all">Confirm & Switch</button>
                 <button onClick={() => setShowLoginConfirm(null)} className="w-full py-4 bg-muted text-foreground rounded-2xl font-bold text-sm hover:bg-border transition-all">Cancel</button>
              </div>
           </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function Modal({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="glass-premium w-full max-w-2xl rounded-[40px] border border-border p-10 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden relative">
        <div className="flex justify-between items-center mb-8">
           <h2 className="text-2xl font-black text-foreground">{title}</h2>
           <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-all text-muted-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide">
           {children}
        </div>
      </div>
    </div>
  );
}

function TenantFormFields({ defaultValues }: { defaultValues?: any }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField label="Organization Name" name="name" placeholder="Acme Corp" defaultValue={defaultValues?.name} required />
      <FormField label="Slug / Subdomain" name="slug" placeholder="acme" defaultValue={defaultValues?.slug} required />
      <FormField label="Admin Email" name="email" type="email" placeholder="admin@acme.com" defaultValue={defaultValues?.email} required />
      <FormField label="Phone Number" name="phone" type="tel" placeholder="+1..." defaultValue={defaultValues?.phone} required />
      <div className="space-y-2">
        <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Company Size</label>
        <select name="size" defaultValue={defaultValues?.size || ""} required className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground">
          <option value="">Select Size</option>
          <option value="1-10">1-10 employees</option>
          <option value="11-50">11-50 employees</option>
          <option value="51-200">51-200 employees</option>
          <option value="201+">201+ employees</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Industry</label>
        <select name="industry" defaultValue={defaultValues?.industry || ""} required className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground">
          <option value="">Select Industry</option>
          <option value="Tech">Technology</option>
          <option value="Finance">Finance</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Retail">Retail</option>
          <option value="Other">Other</option>
        </select>
      </div>
    </div>
  );
}

function FormField({ label, name, placeholder, type = "text", defaultValue, required }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">{label}</label>
      <input 
        name={name}
        required={required}
        type={type} 
        defaultValue={defaultValue}
        className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" 
        placeholder={placeholder} 
      />
    </div>
  );
}

function DetailItem({ label, value, isBadge }: { label: string, value: string, isBadge?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{label}</p>
      {isBadge ? (
        <span className="inline-block px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase">
          {value}
        </span>
      ) : (
        <p className="text-sm font-bold text-foreground">{value}</p>
      )}
    </div>
  );
}
