'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { 
  Mail, 
  Send, 
  Inbox, 
  Star, 
  Trash2, 
  Search,
  Plus,
  Paperclip,
  RotateCcw,
  Settings,
  FileText,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';

export default function CommunicationEmails() {
  const [emails, setEmails] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSmtp, setHasSmtp] = useState<boolean | null>(null);

  useEffect(() => {
    checkSmtp();
    fetchEmails();
  }, []);

  const checkSmtp = async () => {
    try {
      const config = await api.get('/communications/config');
      setHasSmtp(!!config && !!config.host);
    } catch (err) {
      setHasSmtp(false);
    }
  };

  const fetchEmails = async () => {
    try {
      const data = await api.get('/communications/logs');
      setEmails(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      // Don't toast if it's just empty or 404
      console.log('Failed to fetch email logs');
    } finally {
      setIsLoading(false);
    }
  };

  if (hasSmtp === false) {
    return (
      <DashboardLayout>
        <div className="animate-fade-in flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
           <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mb-6 text-amber-500">
              <AlertCircle className="w-10 h-10" />
           </div>
           <h1 className="text-2xl font-black text-foreground mb-4 tracking-tight">Email System Not Configured</h1>
           <p className="text-muted-foreground max-w-md mx-auto mb-10 leading-relaxed">
             You haven't connected an SMTP server yet. To send and receive business emails, please complete the system setup.
           </p>
           <div className="flex space-x-4">
              <Link 
                href="/dashboard/settings/email" 
                className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black flex items-center space-x-3 hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-primary/20"
              >
                <Settings className="w-5 h-5" />
                <span>Configure SMTP Now</span>
              </Link>
           </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="animate-fade-in h-[calc(100vh-160px)] flex flex-col">
        <header className="flex justify-between items-center mb-8">
           <div>
              <h1 className="text-2xl font-black text-foreground mb-1 tracking-tight">Business Inbox</h1>
              <p className="text-muted-foreground text-sm font-medium italic">Connected via SMTP. Monitoring all outbound lead communications.</p>
           </div>
           <div className="flex space-x-4">
              <Link 
                href="/dashboard/communication/templates"
                className="bg-muted text-foreground px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 hover:bg-accent transition-all border border-border"
              >
                 <FileText className="w-5 h-5" />
                 <span>Templates</span>
              </Link>
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 hover:opacity-90 transition-all shadow-lg shadow-primary/25 active:scale-95">
                 <Plus className="w-5 h-5" />
                 <span>Compose Email</span>
              </button>
           </div>
        </header>

        <div className="flex-1 flex gap-8 overflow-hidden">
           {/* Sidebar */}
           <aside className="w-64 space-y-2">
              <NavItem icon={Inbox} label="Inbox" count={emails.length} active />
              <NavItem icon={Send} label="Sent" />
              <NavItem icon={Star} label="Starred" />
              <NavItem icon={Trash2} label="Trash" />
              
              <div className="pt-8">
                 <p className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Labels</p>
                 <div className="space-y-1">
                    <LabelItem color="bg-indigo-500" name="Deals" />
                    <LabelItem color="bg-emerald-500" name="Support" />
                    <LabelItem color="bg-amber-500" name="Marketing" />
                 </div>
              </div>
           </aside>

           {/* Email List */}
           <div className="flex-1 bg-card rounded-[40px] border border-border flex flex-col overflow-hidden premium-shadow">
              <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                 <div className="flex items-center space-x-2">
                    <button onClick={fetchEmails} className="p-2 hover:bg-background rounded-xl transition-all"><RotateCcw className="w-4 h-4 text-muted-foreground" /></button>
                    <div className="h-4 w-[1px] bg-border mx-2"></div>
                    <button className="p-2 hover:bg-background rounded-xl transition-all"><Trash2 className="w-4 h-4 text-muted-foreground" /></button>
                 </div>
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" placeholder="Search mail..." className="bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-xs w-64 focus:outline-none focus:ring-1 focus:ring-primary" />
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-border">
                 {isLoading ? (
                    <div className="p-20 text-center">
                       <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                       <p className="text-sm text-muted-foreground">Synchronizing secure mailbox...</p>
                    </div>
                 ) : emails.length === 0 ? (
                    <div className="p-20 text-center">
                       <Mail className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                       <p className="text-sm text-muted-foreground">Your inbox is currently empty</p>
                    </div>
                 ) : emails.map((email) => (
                    <div key={email.id} className="flex items-center p-6 hover:bg-primary/5 cursor-pointer transition-all group">
                       <div className="mr-6">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                       </div>
                       <div className="w-48 flex-shrink-0">
                          <p className="text-sm font-black text-foreground">{email.from}</p>
                       </div>
                       <div className="flex-1 min-w-0 pr-10">
                          <p className="text-sm truncate font-bold text-foreground">{email.subject}</p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{email.body}</p>
                       </div>
                       <div className="flex items-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Paperclip className="w-4 h-4 text-gray-500" />
                          <Star className="w-4 h-4 text-gray-500 hover:text-amber-500" />
                       </div>
                       <div className="w-24 text-right">
                          <p className="text-[10px] font-black text-gray-500 uppercase">{new Date(email.createdAt).toLocaleDateString()}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function NavItem({ icon: Icon, label, count, active }: any) {
  return (
    <button className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
      <div className="flex items-center space-x-3">
        <Icon className="w-4 h-4" />
        <span className="text-sm font-bold">{label}</span>
      </div>
      {count !== undefined && <span className="text-[10px] font-black px-2 py-0.5 bg-primary/10 rounded-lg">{count}</span>}
    </button>
  );
}

function LabelItem({ color, name }: any) {
  return (
    <button className="w-full flex items-center space-x-3 px-4 py-2 text-muted-foreground hover:text-foreground transition-all">
      <div className={`w-2 h-2 rounded-full ${color}`}></div>
      <span className="text-xs font-bold">{name}</span>
    </button>
  );
}
