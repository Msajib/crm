'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  Globe, 
  User, 
  Users,
  X,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ContactDetailSidebar from '@/components/ContactDetailSidebar';
import ActionDropdown from '@/components/ActionDropdown';
import ModuleGuard from '@/components/ModuleGuard';
import PremiumModal from '@/components/PremiumModal';
import ImportModal from '@/components/ImportModal';


export default function ContactsPage() {
  return (
    <ModuleGuard moduleId="contacts">
      <ContactsContent />
    </ModuleGuard>
  );
}

function ContactsContent() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewingContact, setViewingContact] = useState<any>(null);
  const [editContact, setEditContact] = useState<any>(null);
  const [newContact, setNewContact] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    phone: '', 
    jobTitle: '', 
    address: '',
    source: 'Website'
  });
  const [showImportModal, setShowImportModal] = useState(false);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [contactsRes, staffRes] = await Promise.all([
        fetch('/api/contacts', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/users/staff', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (contactsRes.ok) {
        const data = await contactsRes.json();
        setContacts(data.data || []);
      }
      if (staffRes.ok) {
        const data = await staffRes.json();
        setStaffList(data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load contact data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newContact),
      });
      if (res.ok) {
        toast.success('Contact added!');
        setShowAddModal(false);
        setNewContact({ firstName: '', lastName: '', email: '', phone: '', jobTitle: '', address: '', source: 'Website' });
        fetchContacts();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Addition failed');
      }
    } catch (err) {
      toast.error('Addition failed');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/contacts/${editContact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editContact),
      });
      if (res.ok) {
        toast.success('Contact updated!');
        setShowEditModal(false);
        fetchContacts();
      }
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Contact deleted');
        fetchContacts();
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-8 pb-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-foreground mb-2">Contacts</h1>
            <p className="text-muted-foreground text-sm font-medium">Manage and track your customer relationships with AI lead scoring.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowImportModal(true)}
              className="p-4 bg-muted hover:bg-muted/80 rounded-2xl transition-all text-muted-foreground"
            >
               <Upload className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/25 hover:opacity-90 transition-all flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              ADD CONTACT
            </button>
          </div>
        </header>

        {/* Filters and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div className="md:col-span-3 flex items-center space-x-4 bg-muted/30 p-2 rounded-3xl border border-border">
              <div className="flex-1 relative">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                 <input type="text" placeholder="Search contacts by name, email, or company..." className="w-full bg-transparent border-none py-4 pl-14 pr-6 focus:outline-none text-sm font-medium" />
              </div>
              <button className="px-6 py-3 bg-background border border-border rounded-2xl text-xs font-black flex items-center hover:bg-accent transition-all">
                 <Filter className="w-3 h-3 mr-2" />
                 FILTERS
              </button>
           </div>
           <div className="bg-primary/5 border border-primary/10 rounded-3xl p-4 flex items-center justify-between">
              <div>
                 <p className="text-[10px] font-black text-primary uppercase tracking-widest">Total Contacts</p>
                 <p className="text-2xl font-black text-foreground">{contacts.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                 <Users className="w-5 h-5 text-primary" />
              </div>
           </div>
        </div>

        {/* Table */}
        <div className="glass-card rounded-[40px] border border-border overflow-visible bg-background/40 shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Contact Name</th>
                <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Source</th>
                <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Lead Score</th>
                <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    <p className="mt-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Loading contacts...</p>
                  </td>
                </tr>
              ) : contacts.map((contact) => (
                <tr 
                  key={contact.id} 
                  className="border-b border-border/50 hover:bg-primary/[0.02] transition-colors cursor-pointer group"
                  onClick={() => setViewingContact(contact)}
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                        {contact.firstName?.[0]}{contact.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors">{contact.firstName} {contact.lastName}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">{contact.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                      contact.status === 'CUSTOMER' ? 'bg-emerald-500/10 text-emerald-500' :
                      contact.status === 'LEAD' ? 'bg-indigo-500/10 text-indigo-500' :
                      'bg-amber-500/10 text-amber-500'
                    }`}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-[10px] font-bold text-muted-foreground flex items-center justify-center uppercase tracking-wider">
                      <Globe className="w-3 h-3 mr-2 opacity-50" />
                      {contact.source || 'N/A'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex flex-col items-center">
                       <span className={`text-[10px] font-black ${contact.score > 80 ? 'text-emerald-500' : contact.score > 50 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                          {contact.score || 0}%
                       </span>
                       <div className="w-12 h-1 bg-muted rounded-full mt-1 overflow-hidden">
                          <div className={`h-full ${contact.score > 80 ? 'bg-emerald-500' : contact.score > 50 ? 'bg-amber-500' : 'bg-muted-foreground'}`} style={{ width: `${contact.score || 0}%` }}></div>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right" onClick={e => e.stopPropagation()}>
                     <ActionDropdown 
                        onEdit={() => { setEditContact(contact); setShowEditModal(true); }}
                        onDelete={() => handleDelete(contact.id)}
                        onView={() => setViewingContact(contact)}
                     />
                  </td>
                </tr>
              ))}
              {!loading && contacts.length === 0 && (
                <tr>
                   <td colSpan={5} className="py-20 text-center">
                      <Users className="w-10 h-10 mx-auto text-muted-foreground/30 mb-4" />
                      <p className="text-sm font-black text-foreground">No contacts found</p>
                      <p className="text-xs text-muted-foreground mt-1">Start by adding your first customer record.</p>
                      <button onClick={() => setShowAddModal(true)} className="mt-6 px-6 py-3 bg-primary/10 text-primary rounded-xl text-xs font-black hover:bg-primary hover:text-white transition-all">
                         CREATE NEW CONTACT
                      </button>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


      {viewingContact && (
        <ContactDetailSidebar 
          contact={viewingContact} 
          staffList={staffList} 
          onClose={() => setViewingContact(null)} 
          onRefresh={fetchContacts}
        />
      )}

      {/* Add Contact Modal */}
      <PremiumModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Contact"
        subtitle="Customer Relationship Management"
        footer={(
          <button onClick={handleAdd} className="w-full py-5 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/25 hover:opacity-90 transition-all">CREATE CONTACT</button>
        )}
      >
        <form onSubmit={handleAdd} className="space-y-8">
           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">First Name</label>
                 <input required value={newContact.firstName} onChange={e => setNewContact({...newContact, firstName: e.target.value})} type="text" className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/30" placeholder="John" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Last Name</label>
                 <input required value={newContact.lastName} onChange={e => setNewContact({...newContact, lastName: e.target.value})} type="text" className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/30" placeholder="Doe" />
              </div>
           </div>
           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Email Address</label>
                 <input required value={newContact.email} onChange={e => setNewContact({...newContact, email: e.target.value})} type="email" className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/30" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Phone Number</label>
                 <input value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} type="text" className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/30" placeholder="+1 234..." />
              </div>
           </div>
        </form>
      </PremiumModal>

      {/* Edit Contact Modal */}
      <PremiumModal
        isOpen={showEditModal && !!editContact}
        onClose={() => setShowEditModal(false)}
        title="Edit Contact"
        subtitle="Update Record Details"
        footer={(
          <button onClick={handleEditSubmit} className="w-full py-5 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/25 hover:opacity-90 transition-all">SAVE CHANGES</button>
        )}
      >
        {editContact && (
          <form id="edit-contact-form" onSubmit={handleEditSubmit} className="space-y-6">
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">First Name</label>
                   <input required value={editContact.firstName || ''} onChange={e => setEditContact({...editContact, firstName: e.target.value})} type="text" className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Last Name</label>
                   <input required value={editContact.lastName || ''} onChange={e => setEditContact({...editContact, lastName: e.target.value})} type="text" className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Email</label>
                   <input required value={editContact.email || ''} onChange={e => setEditContact({...editContact, email: e.target.value})} type="email" className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Phone</label>
                   <input value={editContact.phone || ''} onChange={e => setEditContact({...editContact, phone: e.target.value})} type="text" className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Job Title</label>
                   <input value={editContact.jobTitle || ''} onChange={e => setEditContact({...editContact, jobTitle: e.target.value})} type="text" className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Source</label>
                   <input value={editContact.source || ''} onChange={e => setEditContact({...editContact, source: e.target.value})} type="text" className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" placeholder="e.g. Website, Referral" />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Status</label>
                   <select value={editContact.status || 'LEAD'} onChange={e => setEditContact({...editContact, status: e.target.value})} className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all appearance-none">
                     <option value="LEAD">Lead</option>
                     <option value="CUSTOMER">Customer</option>
                     <option value="CHURNED">Churned</option>
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Address</label>
                   <input value={editContact.address || ''} onChange={e => setEditContact({...editContact, address: e.target.value})} type="text" className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
                </div>
             </div>
          </form>
        )}
      </PremiumModal>
      {/* Import Modal */}
      {showImportModal && (
        <ImportModal 
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            fetchContacts();
            setShowImportModal(false);
          }}
        />
      )}
    </DashboardLayout>
  );
}
