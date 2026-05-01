'use client';

import React, { useState } from 'react';
import PremiumModal from './PremiumModal';
import { Mail, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: any;
}

export default function SendEmailModal({ isOpen, onClose, contact }: SendEmailModalProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState({
    subject: '',
    body: `Hi ${contact.firstName},\n\n`
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/communications/email', {
        to: contact.email,
        subject: email.subject,
        body: email.body
      });
      toast.success('Email queued for delivery!');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      title="Compose Email"
      subtitle={`Sending to ${contact.email}`}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
           <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Subject Line</label>
           <input 
             required 
             value={email.subject} 
             onChange={e => setEmail({...email, subject: e.target.value})}
             className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold"
             placeholder="Re: Introduction / Project Update"
           />
        </div>

        <div className="space-y-2">
           <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Message Body</label>
           <textarea 
             required 
             value={email.body} 
             onChange={e => setEmail({...email, body: e.target.value})}
             className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 text-sm font-medium min-h-[300px] resize-none"
             placeholder="Type your message here..."
           />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center space-x-2"
        >
           {loading ? 'Sending...' : (
             <>
               <Send className="w-4 h-4" />
               <span>Dispatch Message</span>
             </>
           )}
        </button>
      </form>
    </PremiumModal>
  );
}
