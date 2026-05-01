'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, CreditCard, Lock, Mail, Building, Phone, User, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [linkDetails, setLinkDetails] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    businessName: '',
    phone: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<any>(null);

  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setError('Invalid payment link');
      setLoading(false);
    }
  }, [token]);

  const validateToken = async () => {
    try {
      const data = await api.get(`/payment/links/${token}/validate`);
      setLinkDetails(data);
    } catch (err: any) {
      setError(err?.message || 'This payment link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const result = await api.post(`/payment/links/${token}/checkout`, {
        customerData: {
          name: formData.name,
          email: formData.email,
          businessName: formData.businessName,
          phone: formData.phone
        },
        paymentData: {
          // In a real app, this would be a Stripe Token or PaymentMethod ID
          mockCard: true
        }
      });
      setSuccess(result);
    } catch (err: any) {
      setError(err?.message || 'Payment failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (error && !success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass-premium max-w-md w-full p-8 rounded-3xl border border-rose-500/20 text-center">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black mb-2">Link Unavailable</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass-premium max-w-md w-full p-8 rounded-3xl border border-emerald-500/20 text-center animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black mb-4 tracking-tight">Account Created!</h1>
          <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
            Your payment was successful. We've sent an email with your login details.
          </p>
          <div className="bg-muted/50 p-6 rounded-2xl">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Your Workspace URL</p>
            <p className="font-mono font-bold text-foreground text-lg">
              {formData.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.crm.test
            </p>
          </div>
          <a href="/login" className="mt-8 inline-block bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold w-full">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        
        {/* Left Column - Details */}
        <div className="space-y-8 lg:py-12">
          <div>
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-6">
              <CheckCircle2 className="w-4 h-4" /> Secure Checkout
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tight mb-4">Complete your purchase</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {linkDetails.description || 'You are one step away from unlocking premium features for your business.'}
            </p>
          </div>

          <div className="glass-premium p-8 rounded-3xl border border-border bg-muted/10">
            <div className="flex justify-between items-end mb-6 pb-6 border-b border-border">
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Plan</p>
                <h3 className="text-2xl font-black text-foreground">{linkDetails.planName || 'Custom Plan'}</h3>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black text-foreground tracking-tight">${linkDetails.customPrice}</p>
                <p className="text-xs font-bold text-muted-foreground uppercase">{linkDetails.currency} {linkDetails.type === 'SUBSCRIPTION' ? '/ month' : 'one-time'}</p>
              </div>
            </div>
            
            <ul className="space-y-4">
              {[
                'Full CRM Access',
                'Advanced Automations',
                'Priority Support',
                'Custom Domain Setup'
              ].map((feature, i) => (
                <li key={i} className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="font-semibold text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="glass-premium p-8 lg:p-10 rounded-[40px] border border-border shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-5">
              <h3 className="text-xl font-black">Account Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input required className="w-full bg-background border border-border rounded-xl pl-11 pr-4 py-3 text-sm font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input required type="email" className="w-full bg-background border border-border rounded-xl pl-11 pr-4 py-3 text-sm font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Business Name</label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input required className="w-full bg-background border border-border rounded-xl pl-11 pr-4 py-3 text-sm font-bold" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} placeholder="Acme Corp" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input className="w-full bg-background border border-border rounded-xl pl-11 pr-4 py-3 text-sm font-bold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 234 567 890" />
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-border my-6"></div>

            <div className="space-y-5">
              <h3 className="text-xl font-black flex items-center justify-between">
                <span>Payment</span>
                <div className="flex space-x-2">
                  <span className="w-8 h-5 bg-muted rounded"></span>
                  <span className="w-8 h-5 bg-muted rounded"></span>
                </div>
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Card Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input required className="w-full bg-background border border-border rounded-xl pl-11 pr-4 py-3 text-sm font-bold font-mono" placeholder="0000 0000 0000 0000" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Expiry</label>
                    <input required className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-bold font-mono" placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">CVC</label>
                    <input required className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-bold font-mono" placeholder="123" />
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground py-5 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex justify-center items-center mt-8 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : `Pay $${linkDetails.customPrice}`}
            </button>
            <p className="text-center text-xs font-bold text-muted-foreground mt-4 flex items-center justify-center">
              <Lock className="w-3 h-3 mr-1" /> Payments are secure and encrypted
            </p>
          </form>
        </div>

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
