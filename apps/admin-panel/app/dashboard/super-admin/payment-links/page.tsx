'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import { Link as LinkIcon, Plus, Copy, Ban, CheckCircle2, X, Globe, DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function PaymentLinksPage() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    type: 'SUBSCRIPTION',
    planId: '',
    planName: '',
    customPrice: '',
    maxUses: 1,
    durationDays: '',
    description: '',
    expiresAt: ''
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLinks();
    fetchPlans();
  }, []);

  const fetchLinks = async () => {
    try {
      const data = await api.get('/payment/links');
      setLinks(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load payment links');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      // Typically from tenant service
      const data = await api.get('/tenant/plans');
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      // Fallback dummy plans if tenant service not reachable or endpoint differs
      setPlans([
        { id: 'starter', name: 'Starter Plan' },
        { id: 'growth', name: 'Growth Plan' },
        { id: 'pro', name: 'Pro Plan' }
      ]);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/payment/links', {
        ...formData,
        customPrice: parseFloat(formData.customPrice),
        maxUses: parseInt(formData.maxUses.toString()),
        durationDays: formData.durationDays ? parseInt(formData.durationDays) : undefined,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
      });
      toast.success('Payment link created');
      setShowCreateModal(false);
      fetchLinks();
    } catch (err) {
      toast.error('Failed to create link');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = (token: string) => {
    const url = `${window.location.origin}/pay?token=${token}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-foreground tracking-tight">Payment Links</h1>
            <p className="text-muted-foreground mt-2 font-medium">Create secure, shareable checkout links for custom plans or one-time sales.</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Create Link</span>
          </button>
        </header>

        {/* Links Table */}
        <div className="glass-premium rounded-[40px] border border-border overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/10">
                <th className="text-left px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Token</th>
                <th className="text-left px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Plan / Details</th>
                <th className="text-left px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Price</th>
                <th className="text-center px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Uses</th>
                <th className="text-left px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                <th className="text-right px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-32 text-center">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
                  </td>
                </tr>
              ) : links.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-32 text-center">
                    <LinkIcon className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-foreground">No Payment Links</h3>
                    <p className="text-muted-foreground text-sm">Generate your first payment link to share with prospects.</p>
                  </td>
                </tr>
              ) : links.map((link) => (
                <tr key={link.id} className="border-b border-border/50 hover:bg-muted/5 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono text-sm font-bold text-foreground">{link.token.substring(0, 8)}...</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-black text-foreground">{link.planName || 'Custom'}</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{link.type}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center font-black">
                      <span className="text-muted-foreground mr-1">$</span>
                      {link.customPrice}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="px-3 py-1 bg-muted rounded-full text-xs font-black">
                      {link.usedCount} / {link.maxUses}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    {link.isActive && (!link.expiresAt || new Date(link.expiresAt) > new Date()) && link.usedCount < link.maxUses ? (
                      <span className="flex items-center text-emerald-500 text-xs font-black"><CheckCircle2 className="w-3 h-3 mr-1" /> ACTIVE</span>
                    ) : (
                      <span className="flex items-center text-rose-500 text-xs font-black"><Ban className="w-3 h-3 mr-1" /> INACTIVE</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleCopy(link.token)}
                        className="p-2 bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white rounded-xl transition-all"
                        title="Copy Link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      {link.isActive && (
                        <button className="p-2 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl transition-all" title="Deactivate">
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-[300] flex items-center justify-center p-4">
          <div className="glass-premium w-full max-w-2xl rounded-[40px] border border-border p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black">Create Payment Link</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-muted rounded-xl"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-6">
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Type</label>
                  <select 
                    className="w-full mt-1 bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm font-bold"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="SUBSCRIPTION">Subscription</option>
                    <option value="ONETIME">One-Time Payment</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Plan Configuration</label>
                  <select 
                    required 
                    className="w-full mt-1 bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm font-bold"
                    value={formData.planId}
                    onChange={e => {
                      const p = plans.find(plan => plan.id === e.target.value);
                      setFormData({...formData, planId: p?.id || '', planName: p?.name || ''});
                    }}
                  >
                    <option value="">Select Base Plan...</option>
                    {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Custom Price ($)</label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      required type="number" step="0.01" min="0"
                      className="w-full bg-muted/50 border border-border rounded-xl pl-9 pr-4 py-3 text-sm font-bold" 
                      value={formData.customPrice}
                      onChange={e => setFormData({...formData, customPrice: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Max Uses</label>
                  <input 
                    required type="number" min="1"
                    className="w-full mt-1 bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm font-bold" 
                    value={formData.maxUses}
                    onChange={e => setFormData({...formData, maxUses: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Expiry Date (Optional)</label>
                  <input 
                    type="date"
                    className="w-full mt-1 bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm font-bold" 
                    value={formData.expiresAt}
                    onChange={e => setFormData({...formData, expiresAt: e.target.value})}
                  />
                </div>
                {formData.type === 'SUBSCRIPTION' && (
                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Free Trial Days</label>
                    <input 
                      type="number" min="0"
                      className="w-full mt-1 bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm font-bold" 
                      value={formData.durationDays}
                      onChange={e => setFormData({...formData, durationDays: e.target.value})}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  rows={3}
                  className="w-full mt-1 bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm font-bold resize-none" 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="What is included in this payment link?"
                />
              </div>

              <div className="pt-4 flex space-x-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-4 bg-muted rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-[2] py-4 bg-primary text-primary-foreground rounded-xl font-black shadow-lg shadow-primary/20 hover:opacity-90 flex justify-center">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
