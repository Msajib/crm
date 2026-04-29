'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Users, 
  Search, 
  Plus, 
  ShieldAlert, 
  Ban, 
  CheckCircle,
  KeyRound,
  LogOut,
  ArrowUpRight,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const DEFAULT_USERS = [
  { id: 'u1', name: 'System Admin', email: 'admin@acme.com', role: 'SUPER_ADMIN', tenant_slug: 'system', isActive: true, joined: '2026-01-15' },
  { id: 'u2', name: 'John Doe', email: 'john@acme.com', role: 'ADMIN', tenant_slug: 'acme', isActive: true, joined: '2026-02-10' },
  { id: 'u3', name: 'Jane Smith', email: 'jane@acme.com', role: 'STAFF', tenant_slug: 'acme', isActive: true, joined: '2026-02-12' },
  { id: 'u4', name: 'Bob Jones', email: 'bob@techflow.io', role: 'ADMIN', tenant_slug: 'techflow', isActive: false, joined: '2026-03-05' },
];

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState('ADMIN');
  const [currentTenantSlug, setCurrentTenantSlug] = useState('');
  
  const [showPasswordModal, setShowPasswordModal] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const role = localStorage.getItem('role') || 'ADMIN';
    const slug = localStorage.getItem('tenant_slug') || 'acme';
    setCurrentUserRole(role);
    setCurrentTenantSlug(slug);

    const loadedUsers = JSON.parse(localStorage.getItem('mock_users_db') || '[]');
    setUsers([...DEFAULT_USERS, ...loadedUsers]);
  }, []);

  // Filter users based on role and tenant
  const displayUsers = users.filter(user => {
      if (currentUserRole === 'SUPER_ADMIN') {
        return user.role === 'ADMIN'; // Super Admin sees only Admin accounts across all tenants
      }
      return user.tenant_slug === currentTenantSlug; // Admins manage their own staff/workspace
    })
    .filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const toggleUserStatus = (userId: string, currentStatus: boolean) => {
    const updated = users.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u);
    setUsers(updated);
    
    // Save to local storage for persistence
    const loadedUsers = JSON.parse(localStorage.getItem('mock_users_db') || '[]');
    const localIndex = loadedUsers.findIndex((u: any) => u.id === userId);
    if (localIndex > -1) {
      loadedUsers[localIndex].isActive = !currentStatus;
      localStorage.setItem('mock_users_db', JSON.stringify(loadedUsers));
    }
    
    toast.success(`User ${!currentStatus ? 'Unbanned' : 'Banned'} successfully.`);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }
    
    setShowPasswordModal(null);
    setNewPassword('');
    toast.success('User password updated successfully.');
  };

  const loginAsStaff = (user: any) => {
    toast.loading(`Authenticating as ${user.name}...`, { duration: 2000 });
    setTimeout(() => {
      // Save original context for "Switch Back"
      localStorage.setItem('original_user', localStorage.getItem('user') || '');
      localStorage.setItem('original_role', localStorage.getItem('role') || 'ADMIN');
      localStorage.setItem('original_tenant_slug', localStorage.getItem('tenant_slug') || 'acme');

      localStorage.setItem('isImpersonating', 'true');
      localStorage.setItem('role', user.role);
      localStorage.setItem('tenant_slug', user.tenant_slug);
      // Map mock slugs to mock IDs for Gateway headers
      const tenantIdMap: any = { 'acme': 't1', 'techflow': 't2', 'global': 't3', 'system': 'system' };
      localStorage.setItem('tenant_id', tenantIdMap[user.tenant_slug] || user.tenant_id || 'system');
      
      localStorage.setItem('user_email', user.email);
      localStorage.setItem('user', JSON.stringify({ firstName: user.name.split(' ')[0], lastName: user.name.split(' ')[1] || '', email: user.email }));
      
      toast.success(`Successfully switched to ${user.name}'s account!`);
      window.location.href = '/dashboard';
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-10">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-foreground mb-2 text-gradient">Team Members</h1>
            <p className="text-muted-foreground">
              Manage your staff and workspace users.
            </p>
          </div>
          {currentUserRole !== 'SUPER_ADMIN' && (
            <div className="flex items-center space-x-3">
              <button className="bg-primary text-white p-4 rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-95 flex items-center space-x-2">
                 <Plus className="w-5 h-5" />
                 <span className="font-bold text-sm hidden sm:inline">Add User</span>
              </button>
            </div>
          )}
        </header>

        {/* Search */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
            className="w-full bg-muted border border-border rounded-3xl pl-14 pr-6 py-5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Users Table */}
        <div className="glass-premium rounded-[48px] border border-border overflow-visible premium-shadow bg-background/50">
          <table className="w-full text-left">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">User Details</th>
                <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Role / Context</th>
                <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-12 text-center text-muted-foreground">
                    <p className="font-bold">No users found.</p>
                  </td>
                </tr>
              ) : (
                displayUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-primary/5 transition-all group">
                    <td className="px-10 py-8">
                      <div className="flex items-center space-x-5">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/10 flex items-center justify-center text-indigo-500 font-black shadow-inner">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full border mb-1 ${
                          user.role === 'ADMIN' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          'bg-primary/10 text-primary border-primary/20'
                        }`}>
                          {user.role}
                        </span>
                        <span className="text-xs font-bold text-muted-foreground">@{user.tenant_slug}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {user.isActive ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Ban className="w-4 h-4 text-red-500" />}
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          user.isActive ? 'text-emerald-500' : 'text-red-500'
                        }`}>{user.isActive ? 'Active' : 'Banned'}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end items-center space-x-2">
                        {/* Change Password */}
                        <button 
                          onClick={() => setShowPasswordModal(user.id)}
                          className="p-2.5 bg-muted text-muted-foreground rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                          title="Change Password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        
                        {/* Ban/Unban */}
                        <button 
                          onClick={() => toggleUserStatus(user.id, user.isActive)}
                          className={`p-2.5 rounded-xl transition-all shadow-sm ${
                            user.isActive 
                              ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' 
                              : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                          }`}
                          title={user.isActive ? "Ban User" : "Unban User"}
                        >
                          {user.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>

                        {/* Impersonate */}
                        {((user.role === 'STAFF' && currentUserRole === 'ADMIN') || (user.role === 'ADMIN' && currentUserRole === 'SUPER_ADMIN')) && (
                          <button 
                            onClick={() => loginAsStaff(user)}
                            className="flex items-center space-x-2 px-3 py-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl hover:bg-indigo-500 hover:text-white transition-all shadow-sm font-bold text-[10px] uppercase tracking-widest"
                            title="Login as Staff"
                          >
                            <span>Impersonate</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="glass-premium w-full max-w-md rounded-[32px] border border-border p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-black text-foreground">Change Password</h2>
               <button onClick={() => { setShowPasswordModal(null); setNewPassword(''); }} className="p-2 hover:bg-muted rounded-xl transition-all text-muted-foreground">
                 <X className="w-4 h-4" />
               </button>
            </div>
            <form onSubmit={handlePasswordChange} className="space-y-4">
               <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">New Password</label>
                  <input 
                    required 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-muted border border-border rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" 
                    placeholder="Enter new secure password" 
                  />
               </div>
               <button type="submit" className="w-full py-4 bg-primary text-white rounded-xl font-black text-sm shadow-xl shadow-primary/25 hover:opacity-90 transition-all mt-2">
                 Update Password
               </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
