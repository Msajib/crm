'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Download,
  Trash2,
  Edit,
  X,
  Globe,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ActionDropdown from '@/components/ActionDropdown';
import ContactDetailSidebar from '@/components/ContactDetailSidebar';

const INITIAL_CONTACTS = [
  { id: 1, name: 'Sarah Jenkins', email: 'sarah@acme.com', phone: '+1 234 567 890', status: 'CUSTOMER', source: 'Website', score: 98 },
  { id: 2, name: 'Michael Chen', email: 'm.chen@techflow.io', phone: '+1 987 654 321', status: 'LEAD', source: 'Referral', score: 82 },
  { id: 3, name: 'Elena Rodriguez', email: 'elena@global.net', phone: '+34 600 123 456', status: 'PROSPECT', source: 'LinkedIn', score: 45 },
  { id: 4, name: 'David Smith', email: 'david@vertex.co', phone: '+44 20 7123 4567', status: 'CUSTOMER', source: 'Direct', score: 91 },
];

export default function ContactsPage() {
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '', status: 'LEAD', source: 'Direct' });

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Date.now();
    setContacts([{ ...newContact, id, score: Math.floor(Math.random() * 100) }, ...contacts]);
    setShowAddModal(false);
    setNewContact({ name: '', email: '', phone: '', status: 'LEAD', source: 'Direct' });
    toast.success('Contact added successfully!');
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      setContacts(contacts.filter(c => c.id !== id));
      toast.success('Contact deleted');
    }
  };

  const [showImportModal, setShowImportModal] = useState(false);
  const [importStep, setImportStep] = useState(1);

  const handleImport = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Mapping CSV fields...',
        success: 'Import successful! 124 contacts added.',
        error: 'Import failed.',
      }
    );
    setShowImportModal(false);
    setImportStep(1);
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-8 pb-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-foreground mb-2">Contacts</h1>
            <p className="text-muted-foreground text-sm">Manage and track your customer relationships with AI lead scoring.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowImportModal(true)}
              className="bg-muted border border-border text-foreground px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center space-x-2 hover:bg-accent transition-all"
            >
              <Download className="w-4 h-4 rotate-180" />
              <span>Import CSV</span>
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center space-x-2 shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span>Add Contact</span>
            </button>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by name, email or phone..." 
              className="w-full bg-muted border border-border rounded-2xl pl-12 pr-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="glass-premium rounded-[40px] border border-border overflow-visible premium-shadow">
          <table className="w-full text-left">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Contact</th>
                <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Source</th>
                <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">AI Score</th>
                <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-primary/5 transition-all group cursor-pointer" onClick={() => setSelectedContact(contact)}>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold text-sm">
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{contact.name}</p>
                        <p className="text-[10px] text-muted-foreground">{contact.email}</p>
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
                    <span className="text-xs text-muted-foreground flex items-center justify-center">
                      <Globe className="w-3 h-3 mr-2 opacity-50" />
                      {contact.source}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex flex-col items-center">
                       <span className={`text-[10px] font-black ${contact.score > 80 ? 'text-emerald-500' : contact.score > 50 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                          {contact.score}%
                       </span>
                       <div className="w-12 h-1 bg-muted rounded-full mt-1 overflow-hidden">
                          <div className={`h-full ${contact.score > 80 ? 'bg-emerald-500' : contact.score > 50 ? 'bg-amber-500' : 'bg-muted-foreground'}`} style={{ width: `${contact.score}%` }}></div>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right" onClick={e => e.stopPropagation()}>
                     <ActionDropdown 
                        onEdit={() => setSelectedContact(contact)}
                        onDelete={() => handleDelete(contact.id)}
                        onView={() => setSelectedContact(contact)}
                     />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedContact && (
        <ContactDetailSidebar contact={selectedContact} onClose={() => setSelectedContact(null)} />
      )}

      {/* Modals ... */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-premium w-full max-w-lg rounded-[40px] border border-border p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-2xl font-black text-foreground">Add New Contact</h2>
               <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-muted rounded-xl transition-all text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Full Name</label>
                  <input required value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} type="text" className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="e.g. John Doe" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Email</label>
                     <input required value={newContact.email} onChange={e => setNewContact({...newContact, email: e.target.value})} type="email" className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="john@example.com" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Phone</label>
                     <input required value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} type="text" className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="+1 234..." />
                  </div>
               </div>
               <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/25 hover:opacity-90 transition-all mt-4">Create Contact</button>
            </form>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-xl z-50 flex items-center justify-center p-6">
          <div className="glass-premium w-full max-w-2xl rounded-[48px] border border-border p-12 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-10">
               <div>
                  <h2 className="text-2xl font-black text-foreground">Import Contacts</h2>
                  <p className="text-xs text-muted-foreground mt-1">Upload your CSV file and map fields to your CRM.</p>
               </div>
               <button onClick={() => setShowImportModal(false)} className="p-3 hover:bg-muted rounded-2xl transition-all text-muted-foreground"><X className="w-6 h-6" /></button>
            </div>
            
            {importStep === 1 ? (
              <div className="space-y-8">
                 <div className="border-2 border-dashed border-border rounded-[32px] p-16 flex flex-col items-center justify-center text-center group hover:border-primary/50 transition-all cursor-pointer">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                       <Download className="w-8 h-8 rotate-180" />
                    </div>
                    <p className="text-sm font-bold text-foreground">Drop your CSV file here</p>
                    <p className="text-xs text-muted-foreground mt-1">Maximum file size: 10MB</p>
                    <button className="mt-8 px-8 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest" onClick={() => setImportStep(2)}>Select File</button>
                 </div>
              </div>
            ) : (
              <div className="space-y-8">
                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Intelligent Field Mapping</p>
                    <div className="grid grid-cols-2 gap-4">
                       <MappingRow csv="Full Name" crm="name" />
                       <MappingRow csv="Email Address" crm="email" />
                       <MappingRow csv="Phone Num" crm="phone" />
                       <MappingRow csv="Company" crm="company" />
                    </div>
                 </div>
                 <button onClick={handleImport} className="w-full py-5 bg-primary text-white rounded-2xl font-black text-sm shadow-2xl shadow-primary/30 hover:opacity-90 transition-all mt-6 active:scale-95">Complete Import</button>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function MappingRow({ csv, crm }: { csv: string, crm: string }) {
   return (
      <div className="p-4 bg-muted border border-border rounded-2xl flex items-center justify-between">
         <span className="text-[10px] font-bold text-muted-foreground">{csv}</span>
         <ChevronRight className="w-4 h-4 text-muted-foreground" />
         <span className="text-[10px] font-black text-primary uppercase">{crm}</span>
      </div>
   );
}
