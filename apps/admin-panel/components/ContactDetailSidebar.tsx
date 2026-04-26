'use client';

import React from 'react';
import { X, FileText, Download, Trash2, Clock, Plus } from 'lucide-react';

interface ContactDetailSidebarProps {
  contact: any;
  onClose: () => void;
}

export default function ContactDetailSidebar({ contact, onClose }: ContactDetailSidebarProps) {
  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-background border-l border-border shadow-2xl z-[60] animate-in slide-in-from-right duration-300 flex flex-col">
       <header className="p-8 border-b border-border flex justify-between items-center bg-muted/30">
          <div className="flex items-center space-x-4">
             <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-xl">
                {contact.name[0]}
             </div>
             <div>
                <h2 className="text-xl font-black text-foreground">{contact.name}</h2>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Lead Score: {contact.score}%</p>
             </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-muted rounded-2xl transition-all text-muted-foreground"><X className="w-6 h-6" /></button>
       </header>

       <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          {/* Communication Timeline */}
          <section>
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Activity Timeline</h3>
                <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">+ Log Activity</button>
             </div>
             <div className="space-y-6">
                <TimelineItem title="Email Sent" desc="Subject: Pricing Proposal for Q2" time="2 hours ago" type="email" />
                <TimelineItem title="Call Logged" desc="Discussed budget constraints and timeline." time="Yesterday" type="call" />
                <TimelineItem title="Lead Scored" desc="AI updated score to 98% based on email open." time="2 days ago" type="ai" />
             </div>
          </section>

          {/* File Attachments */}
          <section>
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">File Attachments</h3>
                <button className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all"><Plus className="w-4 h-4" /></button>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <FileCard name="Proposal_v2.pdf" size="2.4 MB" date="Apr 20" />
                <FileCard name="Tax_ID.png" size="1.1 MB" date="Apr 18" />
             </div>
          </section>

          {/* Deals */}
          <section>
             <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6">Linked Deals</h3>
             <div className="p-6 bg-muted/30 border border-border rounded-[32px] flex items-center justify-between group hover:border-primary/20 transition-all cursor-pointer">
                <div>
                   <p className="text-sm font-bold text-foreground group-hover:text-primary transition-all">Enterprise License</p>
                   <p className="text-[10px] text-muted-foreground font-black uppercase mt-1 tracking-widest">$12,000 • Negotiation</p>
                </div>
                <Download className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
             </div>
          </section>
       </div>

       <footer className="p-8 border-t border-border bg-muted/10">
          <button className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all">
             Start AI Conversation
          </button>
       </footer>
    </div>
  );
}

function TimelineItem({ title, desc, time, type }: any) {
  return (
    <div className="flex space-x-4 relative">
       <div className="absolute left-4 top-10 bottom-0 w-px bg-border"></div>
       <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 z-10 ${
          type === 'email' ? 'bg-indigo-500/10 text-indigo-500' :
          type === 'call' ? 'bg-emerald-500/10 text-emerald-500' :
          'bg-primary/10 text-primary'
       }`}>
          <Clock className="w-4 h-4" />
       </div>
       <div>
          <div className="flex items-center space-x-2">
             <p className="text-sm font-bold text-foreground">{title}</p>
             <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">• {time}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
       </div>
    </div>
  );
}

function FileCard({ name, size, date }: any) {
  return (
    <div className="p-4 bg-muted/30 border border-border rounded-2xl flex flex-col justify-between h-32 group hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden">
       <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1.5 hover:bg-background rounded-lg text-muted-foreground hover:text-foreground"><Download className="w-3 h-3" /></button>
          <button className="p-1.5 hover:bg-background rounded-lg text-muted-foreground hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
       </div>
       <FileText className="w-8 h-8 text-primary" />
       <div>
          <p className="text-[10px] font-bold text-foreground truncate">{name}</p>
          <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest mt-1">{size} • {date}</p>
       </div>
    </div>
  );
}
