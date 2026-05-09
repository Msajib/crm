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
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ActionDropdown from '@/components/ActionDropdown';
import { api } from '@/lib/api';

export default function SuperAdminTenants() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tenants, setTenants] = useState<any[]>([]);
  const [staffCounts, setStaffCounts] = useState<Record<string, number>>({});
  const [tenantAdmins, setTenantAdmins] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState<any>(null);
  const [showExtendModal, setShowExtendModal] = useState<any>(null);
  const [showLoginConfirm, setShowLoginConfirm] = useState<any>(null);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [extensionDays, setExtensionDays] = useState(30);
  const [templates, setTemplates] = useState({
    expiryWarningTemplate: '',
    expiryFinalTemplate: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch tenants first
      const tenantsRes = await api.get('/tenants');
      if (tenantsRes && tenantsRes.data) {
        setTenants(tenantsRes.data);
      }

      // Fetch staff counts separately so it doesn't block if it fails
      try {
        const countsRes = await api.get('/users/internal/staff-counts');
        if (countsRes) {
          setStaffCounts(countsRes);
        }
      } catch (countErr) {
        console.error('Failed to fetch staff counts:', countErr);
      }

      // Fetch all admins
      try {
        const adminsRes = await api.get('/users/internal/all-admins');
        if (adminsRes && Array.isArray(adminsRes)) {
          const adminMap = adminsRes.reduce((acc: any, curr: any) => {
            if (!acc[curr.tenantId]) acc[curr.tenantId] = [];
            acc[curr.tenantId].push(curr);
            return acc;
          }, {});
          setTenantAdmins(adminMap);
        }
      } catch (adminErr) {
        console.error('Failed to fetch admins:', adminErr);
      }
      // Fetch templates
      const settings = await api.get('/tenants/system/settings');
      if (settings) {
        setTemplates({
          expiryWarningTemplate: settings.expiryWarningTemplate || '',
          expiryFinalTemplate: settings.expiryFinalTemplate || ''
        });
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      toast.error('Failed to load system data');
    } finally {
      setLoading(false);
    }
  };

  const handleExtendSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showExtendModal) return;
    const loadingToast = toast.loading('Extending subscription...');
    try {
      await api.patch(`/tenants/${showExtendModal.id}/extend`, { days: extensionDays });
      toast.dismiss(loadingToast);
      toast.success('Subscription extended successfully');
      setShowExtendModal(null);
      fetchData();
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error(err.message || 'Failed to extend subscription');
    }
  };

  const handleUpdateTemplates = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('Saving templates...');
    try {
      await api.put('/tenants/system/expiry-templates', templates);
      toast.dismiss(loadingToast);
      toast.success('Email templates updated!');
      setShowTemplatesModal(false);
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error(err.message || 'Failed to save templates');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const payload = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      email: formData.get('email') as string,
      timezone: 'UTC',
      locale: 'en'
    };
    
    try {
      await api.post('/tenants', payload);
      toast.success('Tenant organization created successfully!');
      setShowAddModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create tenant');
    }
  };

  const handleUpdateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const payload = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
    };
    
    try {
      await api.patch(`/tenants/${showEditModal.id}`, payload);
      toast.success('Tenant details updated!');
      setShowEditModal(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update tenant');
    }
  };

  const performLogin = (tenant: any) => {
    toast.loading(`Authenticating as ${tenant.slug} administrator...`, { duration: 2000 });
    setTimeout(() => {
      // In a real app, we would get a temporary token from the backend for impersonation
      localStorage.setItem('isImpersonating', 'true');
      localStorage.setItem('tenant_slug', tenant.slug);
      localStorage.setItem('role', 'ADMIN');
      toast.success(`Successfully switched to ${tenant.slug} context!`);
      window.location.href = '/dashboard';
    }, 2000);
  };

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tenantAdmins[t.id]?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-10">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black text-foreground mb-2 text-gradient">Tenant Ecosystem</h1>
            <p className="text-muted-foreground">Global oversight of all organizations, billing status, and system health.</p>
          </div>
          <div className="flex items-center space-x-3">
             <div className="bg-primary/10 px-6 py-3 rounded-2xl border border-primary/20">
                <span className="text-xs font-black text-primary uppercase tracking-widest">Total: {tenants.length}</span>
             </div>
              <button onClick={() => setShowAddModal(true)} className="bg-primary text-white p-4 rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-95" title="Add Tenant">
                 <Plus className="w-6 h-6" />
              </button>
              <button onClick={() => setShowTemplatesModal(true)} className="bg-muted text-foreground p-4 rounded-2xl hover:bg-border transition-all" title="Email Templates">
                 <History className="w-6 h-6" />
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
                 <span className="text-[10px] font-black text-muted-foreground uppercase">Total Staff</span>
                 <span className="text-sm font-black text-indigo-500">
                    {Object.values(staffCounts).reduce((a, b) => a + b, 0)}
                 </span>
              </div>
           </div>
        </div>

        {/* Table Content */}
        <div className="glass-premium rounded-[48px] border border-border overflow-x-auto premium-shadow bg-background/50">
          <table className="w-full text-left">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Organization Details</th>
                <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Administrator</th>
                <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Plan</th>
                <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Staff Count</th>
                <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Expires On</th>
                <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={6} className="px-10 py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr>
              ) : filteredTenants.length === 0 ? (
                <tr><td colSpan={6} className="px-10 py-20 text-center font-bold text-muted-foreground">No tenants found.</td></tr>
              ) : (
                filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-primary/5 transition-all group">
                    <td className="px-10 py-8">
                      <div className="flex items-center space-x-6">
                        <div className="w-14 h-14 rounded-[20px] bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/10 flex items-center justify-center text-indigo-500 font-black text-xl shadow-inner">
                          {tenant.name?.charAt(0) || 'T'}
                        </div>
                        <div>
                          <p className="text-base font-black text-foreground">{tenant.name || 'Unnamed'}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">@{tenant.slug || 'no-slug'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                       <div className="flex flex-col items-center space-y-3">
                          {(tenantAdmins[tenant.id] || []).map((admin: any) => (
                            <div key={admin.id} className={`bg-muted/30 px-3 py-2 rounded-xl border w-full max-w-[180px] relative overflow-hidden ${!admin.isActive ? 'opacity-50 grayscale' : 'border-border/50'}`}>
                               <div className="flex items-center justify-between gap-2">
                                  <p className="text-sm font-black text-foreground truncate">{admin.firstName || 'Admin'}</p>
                                  {!admin.isActive && <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" title="Inactive" />}
                                  {admin.role === 'SUPER_ADMIN' && <Shield className="w-3 h-3 text-primary shrink-0" />}
                               </div>
                               <p className="text-[10px] text-muted-foreground tracking-tight truncate">{admin.email}</p>
                            </div>
                          ))}
                          {(!tenantAdmins[tenant.id] || tenantAdmins[tenant.id].length === 0) && (
                             <p className="text-xs text-muted-foreground italic flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3" /> No Admins Found
                             </p>
                          )}
                       </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <span className="px-4 py-1.5 rounded-full text-[10px] font-black border bg-indigo-500/10 text-indigo-500 border-indigo-500/20">
                        {tenant.plan?.name || 'BASIC'}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-center font-black text-foreground">
                       {staffCounts[tenant.id] || 0}
                    </td>
                     <td className="px-10 py-8 text-center">
                        <div className="flex flex-col items-center">
                           <span className={`text-[11px] font-bold ${tenant.expiresAt && new Date(tenant.expiresAt) < new Date() ? 'text-red-500' : 'text-foreground'}`}>
                              {tenant.expiresAt ? new Date(tenant.expiresAt).toLocaleDateString() : 'Never'}
                           </span>
                           {tenant.expiresAt && new Date(tenant.expiresAt) < new Date() && (
                              <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter">Expired</span>
                           )}
                        </div>
                     </td>
                     <td className="px-10 py-8">
                      <div className="flex items-center justify-center space-x-2">
                        {tenant.status === 'ACTIVE' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> :
                         <Ban className="w-4 h-4 text-red-500" />}
                        <span className={`text-[10px] font-black uppercase ${
                          tenant.status === 'ACTIVE' ? 'text-emerald-500' : 'text-red-500'
                        }`}>{tenant.status}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end items-center space-x-3">
                        <button 
                          onClick={() => setShowLoginConfirm(tenant)}
                          className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl hover:bg-indigo-500 hover:text-white transition-all group/btn shadow-sm"
                          title="Login as Admin"
                        >
                          <ArrowUpRight className="w-5 h-5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                        </button>
                         <button 
                            onClick={() => setShowExtendModal(tenant)}
                            className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                            title="Extend Subscription"
                          >
                            <Clock className="w-5 h-5" />
                          </button>
                         <ActionDropdown 
                            onView={() => setShowViewModal(tenant)}
                            onEdit={() => setShowEditModal(tenant)}
                            onDelete={() => {}}
                         />
                      </div>
                    </td>
                  </tr>
                ))
              )}
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
                   <h3 className="text-base font-black">{showViewModal.name}</h3>
                   <p className="text-muted-foreground text-sm">@{showViewModal.slug}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <DetailItem label="Slug" value={showViewModal.slug} />
                 <DetailItem label="Staff Count" value={String(staffCounts[showViewModal.id] || 0)} />
                 <DetailItem label="Status" value={showViewModal.status} isBadge />
                 <DetailItem label="Plan" value={showViewModal.plan?.name || 'BASIC'} isBadge />
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
              <h2 className="text-xl font-black mb-2">Switch Context?</h2>
              <p className="text-muted-foreground text-sm mb-8">You are about to login as the administrator of <strong>{showLoginConfirm.name}</strong>. Your current session will be temporarily switched.</p>
              <div className="flex flex-col space-y-3">
                 <button onClick={() => performLogin(showLoginConfirm)} className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/25 hover:opacity-90 transition-all">Confirm & Switch</button>
                 <button onClick={() => setShowLoginConfirm(null)} className="w-full py-4 bg-muted text-foreground rounded-2xl font-bold text-sm hover:bg-border transition-all">Cancel</button>
              </div>
           </div>
        </div>
      )}
      {showExtendModal && (
        <Modal title="Extend Subscription" onClose={() => setShowExtendModal(null)}>
           <form onSubmit={handleExtendSubscription} className="space-y-6">
              <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 mb-6">
                 <p className="text-sm font-medium text-emerald-600">Extending access for <strong>{showExtendModal.name}</strong>. This will be logged in payment history as a manual adjustment.</p>
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Extension Period (Days)</label>
                 <select 
                   value={extensionDays}
                   onChange={(e) => setExtensionDays(Number(e.target.value))}
                   className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
                 >
                    <option value={7}>7 Days (Trial Extension)</option>
                    <option value={14}>14 Days</option>
                    <option value={30}>30 Days (Standard Month)</option>
                    <option value={90}>90 Days (Quarterly)</option>
                    <option value={365}>365 Days (Annual)</option>
                 </select>
              </div>
              <button type="submit" className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-500/25 hover:opacity-90 transition-all mt-4">Confirm Extension</button>
           </form>
        </Modal>
      )}

      {showTemplatesModal && (
        <Modal title="Email Templates" onClose={() => setShowTemplatesModal(false)}>
           <form onSubmit={handleUpdateTemplates} className="space-y-8">
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">3-Day Warning Template</label>
                    <textarea 
                      value={templates.expiryWarningTemplate}
                      onChange={(e) => setTemplates({...templates, expiryWarningTemplate: e.target.value})}
                      className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px]"
                      placeholder="Enter the email message for the 3-day warning..."
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Final Expiry Template</label>
                    <textarea 
                      value={templates.expiryFinalTemplate}
                      onChange={(e) => setTemplates({...templates, expiryFinalTemplate: e.target.value})}
                      className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px]"
                      placeholder="Enter the email message for the final expiry day..."
                    />
                 </div>
              </div>
              <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/25 hover:opacity-90 transition-all mt-4">Save Template Changes</button>
           </form>
        </Modal>
      )}
    </DashboardLayout>
  );
}

function Modal({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="glass-premium w-full max-w-2xl rounded-[40px] border border-border p-10 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden relative">
        <div className="flex justify-between items-center mb-8">
           <h2 className="text-xl font-black text-foreground">{title}</h2>
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
    <div className="grid grid-cols-1 gap-4">
      <FormField label="Organization Name" name="name" placeholder="Acme Corp" defaultValue={defaultValues?.name} required />
      <FormField label="Slug / Subdomain" name="slug" placeholder="acme" defaultValue={defaultValues?.slug} required />
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
