'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Users, Search, Plus, Ban, CheckCircle, KeyRound, ArrowUpRight, X, Shield, Lock, Settings, LayoutGrid, Check, Info, Edit2, Trash2, MoreVertical
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';

type TabType = 'members' | 'roles';

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>('members');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  
  const [newMember, setNewMember] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'STAFF',
    customRoleId: ''
  });

  const [editingMember, setEditingMember] = useState<any>(null);
  const [resetMemberId, setResetMemberId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });
  const [editingRole, setEditingRole] = useState<any>(null);

  const availablePermissions = [
    { id: 'dashboard:view', name: 'Dashboard Overview' },
    
    // Leads
    { id: 'leads:read', name: 'View Leads' },
    { id: 'leads:write', name: 'Create/Edit Leads' },
    { id: 'leads:delete', name: 'Delete Leads' },
    
    // Contacts
    { id: 'contacts:read', name: 'View Contacts' },
    { id: 'contacts:write', name: 'Create/Edit Contacts' },
    { id: 'contacts:delete', name: 'Delete Contacts' },
    { id: 'contacts:import', name: 'Import Contacts' },
    
    // Deals
    { id: 'deals:read', name: 'View Deals' },
    { id: 'deals:write', name: 'Create/Edit Deals' },
    { id: 'deals:delete', name: 'Delete Deals' },
    
    // Tasks
    { id: 'tasks:read', name: 'View Tasks' },
    { id: 'tasks:write', name: 'Create/Edit Tasks' },
    { id: 'tasks:delete', name: 'Delete Tasks' },
    
    // Modules
    { id: 'communications:view', name: 'Communications (Email/Calls)' },
    { id: 'marketing:view', name: 'Marketing & Social' },
    { id: 'marketing:manage', name: 'Manage Campaigns' },
    { id: 'analytics:view', name: 'Analytics & Reports' },
    { id: 'payments:view', name: 'Payments & Billing' },
    { id: 'ai:view', name: 'AI Features' },
    
    // System
    { id: 'settings:branding', name: 'System Branding' },
    { id: 'settings:users', name: 'Team Management' },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [membersData, rolesData] = await Promise.all([
        api.get('/users/staff'),
        api.get('/roles')
      ]);

      if (membersData && !membersData.error && Array.isArray(membersData.data)) {
        setUsers(membersData.data);
      } else {
        setUsers([]);
      }

      if (rolesData && !rolesData.error && Array.isArray(rolesData)) {
        setRoles(rolesData);
      } else {
        setRoles([]);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setUsers([]);
      setRoles([]);
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users/staff', newMember);
      toast.success('Team member created successfully');
      setShowAddMemberModal(false);
      setNewMember({ firstName: '', lastName: '', email: '', password: '', role: 'STAFF', customRoleId: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create member');
    }
  };

  const handleEditMember = (user: any) => {
    setEditingMember({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      customRoleId: user.customRoleId || ''
    });
    setShowEditMemberModal(true);
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('Updating operative clearances...');
    try {
      const payload: any = {
        firstName: editingMember.firstName,
        lastName: editingMember.lastName,
        role: 'STAFF'
      };
      
      if (editingMember.customRoleId) {
        payload.customRoleId = editingMember.customRoleId;
      }

      await api.put(`/users/staff/${editingMember.id}`, payload);
      
      toast.dismiss(loadingToast);
      toast.success('Member updated successfully');
      setShowEditMemberModal(false);
      setEditingMember(null);
      fetchData();
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error(err.message || 'Failed to update member');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return toast.error('Password is required');
    const loadingToast = toast.loading('Updating credentials...');
    try {
      await api.post(`/users/staff/${resetMemberId}/reset-password`, { password: newPassword });
      toast.dismiss(loadingToast);
      toast.success('Credentials reset successfully');
      setShowResetPasswordModal(false);
      setNewPassword('');
      setResetMemberId(null);
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error(err.message || 'Failed to reset credentials');
    }
  };

  const handleDeactivate = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this operative? They will lose all system access immediately.')) return;
    const loadingToast = toast.loading('Revoking access...');
    try {
      await api.delete(`/users/staff/${userId}`);
      toast.dismiss(loadingToast);
      toast.success('Operative deactivated');
      fetchData();
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error(err.message || 'Failed to deactivate member');
    }
  };

  const handleReactivate = async (userId: string) => {
    const loadingToast = toast.loading('Restoring access...');
    try {
      await api.put(`/users/staff/${userId}`, { isActive: true });
      toast.dismiss(loadingToast);
      toast.success('Operative access restored');
      fetchData();
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error(err.message || 'Failed to reactivate member');
    }
  };

  const handleDeletePermanent = async (userId: string) => {
    if (!confirm('CRITICAL ACTION: This will permanently purge all operative data. This cannot be undone. Proceed?')) return;
    const loadingToast = toast.loading('Purging data...');
    try {
      await api.delete(`/users/staff/${userId}/permanent`);
      toast.dismiss(loadingToast);
      toast.success('Operative data purged');
      fetchData();
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error(err.message || 'Failed to delete member');
    }
  };

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.name?.trim()) return toast.error('Role name is required');
    const loadingToast = toast.loading('Establishing security protocol...');
    try {
      await api.post('/roles', {
        name: newRole.name.trim(),
        description: newRole.description || '',
        permissions: newRole.permissions,
      });
      toast.dismiss(loadingToast);
      toast.success('Role created successfully');
      setShowAddRoleModal(false);
      setNewRole({ name: '', description: '', permissions: [] });
      fetchData();
    } catch (err: any) {
      toast.dismiss(loadingToast);
      const apiMsg = err?.data?.message;
      const displayMsg = Array.isArray(apiMsg) ? apiMsg.join(', ') : (apiMsg || err.message || 'Failed to create role');
      toast.error(displayMsg);
    }
  };

  const handleEditRole = (role: any) => {
    setEditingRole({ ...role });
    setShowEditRoleModal(true);
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole.name?.trim()) return toast.error('Role name is required');
    const loadingToast = toast.loading('Updating security protocol...');
    try {
      // Only send whitelisted fields — sending the full object (with id, _count, etc.) crashes Prisma
      const payload = {
        name: editingRole.name.trim(),
        description: editingRole.description || '',
        permissions: editingRole.permissions || [],
      };
      await api.patch(`/roles/${editingRole.id}`, payload);
      toast.dismiss(loadingToast);
      toast.success('Role updated successfully');
      setShowEditRoleModal(false);
      setEditingRole(null);
      fetchData();
    } catch (err: any) {
      toast.dismiss(loadingToast);
      // Extract NestJS-style error messages (can be a string or an array)
      const apiMsg = err?.data?.message;
      const displayMsg = Array.isArray(apiMsg) ? apiMsg.join(', ') : (apiMsg || err.message || 'Failed to update role');
      toast.error(displayMsg);
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role? This cannot be undone.')) return;
    const loadingToast = toast.loading('Decommissioning role...');
    try {
      await api.delete(`/roles/${id}`);
      toast.dismiss(loadingToast);
      toast.success('Role deleted successfully');
      fetchData();
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error(err.message || 'Failed to delete role');
    }
  };

  const togglePermission = (permId: string, isEditing = false) => {
    if (isEditing) {
      setEditingRole(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permId)
          ? prev.permissions.filter((p: string) => p !== permId)
          : [...prev.permissions, permId]
      }));
    } else {
      setNewRole(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permId)
          ? prev.permissions.filter(p => p !== permId)
          : [...prev.permissions, permId]
      }));
    }
  };

  const filteredUsers = users.filter(user => 
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-foreground mb-2 text-gradient">Team & Permissions</h1>
            <p className="text-muted-foreground font-medium">Control access and manage your workspace operatives.</p>
          </div>
          <div className="flex bg-muted/50 p-1.5 rounded-2xl border border-border self-start">
            <button 
              onClick={() => setActiveTab('members')}
              className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'members' ? 'bg-background text-primary shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Team Members
            </button>
            <button 
              onClick={() => setActiveTab('roles')}
              className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'roles' ? 'bg-background text-primary shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Roles & Access
            </button>
          </div>
        </header>

        {activeTab === 'members' ? (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Find a teammate..." 
                  className="w-full bg-muted border border-border rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setShowAddMemberModal(true)}
                className="w-full md:w-auto bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Operative</span>
              </button>
            </div>

            <div className="glass-premium rounded-[40px] border border-border overflow-visible premium-shadow">
              <table className="w-full text-left border-collapse">
                <thead className="bg-muted/30 border-b border-border">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Operative</th>
                    <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Role</th>
                    <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Permissions</th>
                    <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {loading ? (
                    <tr><td colSpan={4} className="px-8 py-20 text-center text-muted-foreground animate-pulse">Initializing data stream...</td></tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan={4} className="px-8 py-20 text-center text-muted-foreground font-bold">No operatives found in current sector.</td></tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className={`hover:bg-primary/5 transition-colors group ${!user.isActive ? 'opacity-50 grayscale' : ''}`}>
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 flex items-center justify-center text-primary font-black shadow-inner">
                              {user.firstName[0]}{user.lastName[0]}
                            </div>
                            <div>
                              <p className="text-sm font-black text-foreground">{user.firstName} {user.lastName}</p>
                              <p className="text-[10px] font-bold text-muted-foreground mt-0.5">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.role === 'ADMIN' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                            {user.customRole?.name || user.role}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-wrap gap-1">
                            {user.permissions?.slice(0, 3).map((p: string) => {
                              const permName = availablePermissions.find(ap => ap.id === p)?.name || p.split(':')[0];
                              return (
                                <span key={p} className="px-2 py-0.5 bg-muted text-[9px] font-bold text-muted-foreground rounded-md whitespace-nowrap">
                                  {permName}
                                </span>
                              );
                            })}
                            {user.permissions?.length > 3 && <span className="text-[9px] font-bold text-muted-foreground">+{user.permissions.length - 3}</span>}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right relative">
                           <div className="flex justify-end items-center">
                              <div className="relative group/menu">
                                <button className="p-2 hover:bg-muted rounded-xl transition-all text-muted-foreground group-hover/menu:text-foreground">
                                   <MoreVertical className="w-5 h-5" />
                                </button>
                                
                                <div className="absolute right-0 top-full mt-2 w-56 bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-[999] p-2 overflow-visible ring-1 ring-black/5">
                                   <button 
                                     onClick={() => handleEditMember(user)}
                                     className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/10 text-xs font-black text-muted-foreground hover:text-primary transition-all"
                                   >
                                      <Edit2 className="w-4 h-4 text-primary" />
                                      Edit Clearances
                                   </button>
                                   <button 
                                     onClick={() => { setResetMemberId(user.id); setShowResetPasswordModal(true); }}
                                     className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-xs font-black text-muted-foreground hover:text-foreground transition-all"
                                   >
                                      <KeyRound className="w-4 h-4 text-amber-500" />
                                      Reset Credentials
                                   </button>
                                   <div className="h-px bg-border my-2 mx-2" />
                                   {user.isActive ? (
                                     <button 
                                       onClick={() => handleDeactivate(user.id)}
                                       className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-amber-500/10 text-xs font-black text-amber-500 transition-all"
                                     >
                                        <Ban className="w-4 h-4" />
                                        Deactivate Access
                                     </button>
                                   ) : (
                                     <button 
                                       onClick={() => handleReactivate(user.id)}
                                       className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/10 text-xs font-black text-primary transition-all"
                                     >
                                        <CheckCircle className="w-4 h-4" />
                                        Reactivate Access
                                     </button>
                                   )}
                                   <button 
                                     onClick={() => handleDeletePermanent(user.id)}
                                     className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/10 text-xs font-black text-destructive transition-all"
                                   >
                                      <Trash2 className="w-4 h-4" />
                                      Permanent Delete
                                   </button>
                                </div>
                              </div>
                           </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground font-medium italic">Define custom security clearances and module access.</p>
              <button 
                onClick={() => setShowAddRoleModal(true)}
                className="bg-foreground text-background px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:opacity-90 active:scale-95 transition-all flex items-center space-x-2"
              >
                <Shield className="w-4 h-4" />
                <span>Create Role</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {roles.map(role => (
                <div key={role.id} className="glass-premium p-8 rounded-[32px] border border-border hover:border-primary/50 transition-all group relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Shield className="w-24 h-24" />
                   </div>
                   <h3 className="text-xl font-black text-foreground mb-2 flex items-center gap-2">
                     {role.name}
                     {role.name === 'Admin' && <CheckCircle className="w-4 h-4 text-primary" />}
                   </h3>
                   <p className="text-xs text-muted-foreground font-medium mb-6 line-clamp-2">{role.description || 'No description provided for this security clearance.'}</p>
                   
                   <div className="space-y-3">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Permissions ({role.permissions.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {role.permissions.map((p: string) => {
                          const permName = availablePermissions.find(ap => ap.id === p)?.name || p.replace(':', ' ');
                          return (
                            <span key={p} className="px-3 py-1 bg-primary/5 text-[9px] font-black text-primary rounded-lg border border-primary/10">
                              {permName}
                            </span>
                          );
                        })}
                      </div>
                   </div>

                    <div className="mt-8 pt-6 border-t border-border/50 flex justify-between items-center">
                       <span className="text-[10px] font-bold text-muted-foreground">{role._count?.users || 0} Active Users</span>
                       <div className="flex gap-4">
                          <button 
                            onClick={() => handleEditRole(role)}
                            className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                          >
                            Edit Access
                          </button>
                          <button 
                            onClick={() => handleDeleteRole(role.id)}
                            className="text-[10px] font-black text-destructive uppercase tracking-widest hover:underline"
                          >
                            Delete
                          </button>
                       </div>
                    </div>
                 </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-xl z-[1000] flex items-center justify-center p-4">
          <div className="glass-premium w-full max-w-xl rounded-[48px] border border-border p-12 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8">
               <button onClick={() => setShowAddMemberModal(false)} className="p-3 hover:bg-muted rounded-2xl transition-all text-muted-foreground">
                 <X className="w-6 h-6" />
               </button>
            </div>
            
            <div className="mb-10">
               <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-primary" />
               </div>
               <h2 className="text-3xl font-black text-foreground">Deploy New Operative</h2>
               <p className="text-sm text-muted-foreground mt-2 font-medium">Assign credentials and security clearance.</p>
            </div>

            <form onSubmit={handleAddMember} className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">First Name</label>
                    <input 
                      required 
                      type="text" 
                      value={newMember.firstName}
                      onChange={(e) => setNewMember({...newMember, firstName: e.target.value})}
                      className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" 
                      placeholder="e.g. John" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Last Name</label>
                    <input 
                      required 
                      type="text" 
                      value={newMember.lastName}
                      onChange={(e) => setNewMember({...newMember, lastName: e.target.value})}
                      className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" 
                      placeholder="e.g. Doe" 
                    />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Secure Email ID</label>
                  <input 
                    required 
                    type="email" 
                    value={newMember.email}
                    onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                    className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" 
                    placeholder="operative@company.com" 
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Security Access Key</label>
                  <input 
                    required 
                    type="password" 
                    value={newMember.password}
                    onChange={(e) => setNewMember({...newMember, password: e.target.value})}
                    className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" 
                    placeholder="••••••••" 
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Assigned Security Role</label>
                  <div className="relative">
                    <select 
                      value={newMember.customRoleId}
                      onChange={(e) => setNewMember({...newMember, customRoleId: e.target.value})}
                      className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none"
                    >
                      <option value="">Default Staff Level</option>
                      {roles.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                       <LayoutGrid className="w-4 h-4" />
                    </div>
                  </div>
               </div>
               
               <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:opacity-90 transition-all active:scale-95 mt-4">
                 Initialize Operative
               </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditMemberModal && editingMember && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-xl z-[1000] flex items-center justify-center p-4">
          <div className="glass-premium w-full max-w-xl rounded-[48px] border border-border p-12 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8">
               <button onClick={() => setShowEditMemberModal(false)} className="p-3 hover:bg-muted rounded-2xl transition-all text-muted-foreground">
                 <X className="w-6 h-6" />
               </button>
            </div>
            
            <div className="mb-10">
               <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Edit2 className="w-6 h-6 text-primary" />
               </div>
               <h2 className="text-3xl font-black text-foreground">Update Operative</h2>
               <p className="text-sm text-muted-foreground mt-2 font-medium">Modify credentials and clearance levels.</p>
            </div>

            <form onSubmit={handleUpdateMember} className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">First Name</label>
                    <input 
                      required 
                      type="text" 
                      value={editingMember.firstName}
                      onChange={(e) => setEditingMember({...editingMember, firstName: e.target.value})}
                      className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Last Name</label>
                    <input 
                      required 
                      type="text" 
                      value={editingMember.lastName}
                      onChange={(e) => setEditingMember({...editingMember, lastName: e.target.value})}
                      className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" 
                    />
                  </div>
               </div>

               <div className="space-y-2 opacity-60">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Email (Cannot Change)</label>
                  <input 
                    disabled
                    type="email" 
                    value={editingMember.email}
                    className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm font-bold text-muted-foreground cursor-not-allowed" 
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Assigned Security Role</label>
                  <div className="relative">
                    <select 
                      value={editingMember.customRoleId}
                      onChange={(e) => setEditingMember({...editingMember, customRoleId: e.target.value})}
                      className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none"
                    >
                      <option value="">Default Staff Level</option>
                      {roles.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                       <LayoutGrid className="w-4 h-4" />
                    </div>
                  </div>
               </div>

               {/* Base Level Role removed as requested - all team members are STAFF with custom roles */}
               <input type="hidden" value="STAFF" />
               
               <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:opacity-90 transition-all active:scale-95 mt-4">
                 Save Changes
               </button>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-xl z-[1000] flex items-center justify-center p-4">
          <div className="glass-premium w-full max-w-md rounded-[48px] border border-border p-12 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-10">
               <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                  <KeyRound className="w-6 h-6 text-amber-500" />
               </div>
               <button onClick={() => setShowResetPasswordModal(false)} className="p-3 hover:bg-muted rounded-2xl transition-all text-muted-foreground">
                 <X className="w-6 h-6" />
               </button>
            </div>
            
            <h2 className="text-3xl font-black text-foreground">Reset Credentials</h2>
            <p className="text-sm text-muted-foreground mt-2 font-medium mb-8">Establish a new security access key for this operative.</p>

            <form onSubmit={handleResetPassword} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">New Access Key</label>
                  <input 
                    required 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" 
                    placeholder="Enter new strong password" 
                  />
               </div>
               <button type="submit" className="w-full py-5 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-amber-500/30 hover:opacity-90 transition-all active:scale-95 mt-4">
                 Update Access Key
               </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Role Modal */}
      {showAddRoleModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-xl z-[1000] flex items-center justify-center p-4">
          <div className="glass-premium w-full max-w-2xl rounded-[48px] border border-border p-12 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-10">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-foreground text-background rounded-2xl flex items-center justify-center">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-foreground">Create Security Role</h2>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Configure Access Matrix</p>
                  </div>
               </div>
               <button onClick={() => setShowAddRoleModal(false)} className="p-3 hover:bg-muted rounded-2xl transition-all text-muted-foreground">
                 <X className="w-6 h-6" />
               </button>
            </div>

            <form onSubmit={handleAddRole} className="space-y-8">
               <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Role Name</label>
                    <input 
                      required 
                      type="text" 
                      value={newRole.name}
                      onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                      className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" 
                      placeholder="e.g. Sales Coordinator" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Description</label>
                    <textarea 
                      value={newRole.description}
                      onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                      className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[80px]" 
                      placeholder="Briefly describe what this role entails..." 
                    />
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Module Clearances</label>
                  <div className="grid grid-cols-2 gap-3">
                    {availablePermissions.map(perm => (
                      <div 
                        key={perm.id}
                        onClick={() => togglePermission(perm.id)}
                        className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                          newRole.permissions.includes(perm.id) 
                            ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/5' 
                            : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted/50'
                        }`}
                      >
                        <span className="text-xs font-bold">{perm.name}</span>
                        {newRole.permissions.includes(perm.id) ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                        )}
                      </div>
                    ))}
                  </div>
               </div>

               <button type="submit" className="w-full py-5 bg-foreground text-background rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95">
                 Finalize Security Role
               </button>
            </form>
          </div>
        </div>
      )}
      {/* Edit Role Modal */}
      {showEditRoleModal && editingRole && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-xl z-[1000] flex items-center justify-center p-4">
          <div className="glass-premium w-full max-w-2xl rounded-[48px] border border-border p-12 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto relative">
            <div className="absolute top-0 right-0 p-8">
               <button onClick={() => setShowEditRoleModal(false)} className="p-3 hover:bg-muted rounded-2xl transition-all text-muted-foreground">
                 <X className="w-6 h-6" />
               </button>
            </div>
            
            <div className="flex items-center gap-4 mb-10">
               <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                 <Edit2 className="w-6 h-6" />
               </div>
               <div>
                 <h2 className="text-2xl font-black text-foreground">Modify Security Role</h2>
                 <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Update Access Matrix</p>
               </div>
            </div>

            <form onSubmit={handleUpdateRole} className="space-y-8">
               <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Role Name</label>
                    <input 
                      required 
                      type="text" 
                      value={editingRole.name}
                      onChange={(e) => setEditingRole({...editingRole, name: e.target.value})}
                      className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Description</label>
                    <textarea 
                      value={editingRole.description}
                      onChange={(e) => setEditingRole({...editingRole, description: e.target.value})}
                      className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[80px]" 
                    />
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Module Clearances</label>
                  <div className="grid grid-cols-2 gap-3">
                    {availablePermissions.map(perm => (
                      <div 
                        key={perm.id}
                        onClick={() => togglePermission(perm.id, true)}
                        className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                          editingRole.permissions.includes(perm.id) 
                            ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/5' 
                            : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted/50'
                        }`}
                      >
                        <span className="text-xs font-bold">{perm.name}</span>
                        {editingRole.permissions.includes(perm.id) ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                        )}
                      </div>
                    ))}
                  </div>
               </div>

               <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95">
                 Save Role Updates
               </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
