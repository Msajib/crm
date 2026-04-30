'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CreditCard, CheckCircle, Shield, Building, Loader2, Lock } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function PublicSubscribePage() {
  const params = useParams();
  const tenantId = params?.tenantId as string;
  const [tenant, setTenant] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [paymentStep, setPaymentStep] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state for autocomplete (pre-filled if logged in)
  const [billingInfo, setBillingInfo] = useState({
    name: '',
    email: '',
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  useEffect(() => {
    if (tenantId) {
      fetchData();
    }
  }, [tenantId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // We need a public endpoint to get tenant name and plans
      // For now, we simulate or use the existing ones if they don't require auth
      const [tenantData, plansData] = await Promise.all([
        api.get(`/tenants/${tenantId}`),
        api.get('/tenants/plans')
      ]);
      setTenant(tenantData);
      setPlans(plansData);
      
      // Try to get user info if logged in for autocomplete
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        const user = await api.get('/auth/me');
        if (user) {
          setBillingInfo(prev => ({
            ...prev,
            name: user.name || '',
            email: user.email || ''
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load subscription data', err);
      toast.error('Unable to load subscription details. Please check the link.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setIsProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, call /payments/subscribe
      await api.post(`/tenants/${tenantId}/extend`, { days: 30 });
      
      toast.success('Subscription renewed successfully!');
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    } catch (err) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Preparing Secure Checkout...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="glass-premium p-12 rounded-[50px] border border-border text-center max-w-md">
           <Building className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
           <h1 className="text-2xl font-black text-foreground mb-2">Invalid Renewal Link</h1>
           <p className="text-muted-foreground text-sm mb-8">We couldn't find the workspace associated with this link. Please contact support.</p>
           <a href="/login" className="block w-full py-4 bg-muted rounded-2xl font-black text-xs uppercase">Return to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-20 px-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-20 space-y-4">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
              <Shield className="w-3 h-3" />
              Secure Checkout for {tenant.name}
           </div>
           <h1 className="text-5xl font-black tracking-tight text-gradient">Renew Your Subscription</h1>
           <p className="text-muted-foreground max-w-xl mx-auto font-medium italic">
             Select a plan to continue accessing your CRM workspace. Your data is safe and will be restored immediately upon payment.
           </p>
        </header>

        {!paymentStep ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                className={`glass-premium p-10 rounded-[48px] border-2 transition-all relative overflow-hidden flex flex-col ${selectedPlan?.id === plan.id ? 'border-primary shadow-2xl shadow-primary/20 scale-105 z-10' : 'border-border hover:border-border/80'}`}
              >
                <h2 className="text-2xl font-black text-foreground mb-1">{plan.name}</h2>
                <div className="flex items-end gap-1 mb-8">
                  <span className="text-4xl font-black text-foreground">${plan.price}</span>
                  <span className="text-sm text-muted-foreground mb-1">/mo</span>
                </div>

                <div className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feature: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => { setSelectedPlan(plan); setPaymentStep(true); }}
                  className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/25 hover:opacity-90 transition-all"
                >
                  Select {plan.name}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 animate-in slide-in-from-bottom-8 duration-500">
             {/* Order Summary */}
             <div className="space-y-8">
                <div className="glass-premium p-8 rounded-[40px] border border-border">
                   <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-6">Order Summary</h3>
                   <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-medium text-muted-foreground">{selectedPlan.name} Plan (Monthly)</span>
                      <span className="text-sm font-black text-foreground">${selectedPlan.price}.00</span>
                   </div>
                   <div className="h-[1px] bg-border my-4"></div>
                   <div className="flex justify-between items-center">
                      <span className="text-lg font-black text-foreground">Total Due Today</span>
                      <span className="text-2xl font-black text-primary">${selectedPlan.price}.00</span>
                   </div>
                </div>
                <button 
                  onClick={() => setPaymentStep(false)}
                  className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-foreground transition-all px-4"
                >
                  ← Back to plans
                </button>
             </div>

             {/* Payment Form */}
             <div className="glass-premium p-10 rounded-[40px] border border-border space-y-8 premium-shadow">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-lg font-black text-foreground">Secure Payment</h3>
                   <div className="flex gap-2">
                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                      <Lock className="w-5 h-5 text-emerald-500" />
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-2">Full Name</label>
                      <input 
                        type="text" 
                        value={billingInfo.name}
                        onChange={e => setBillingInfo({...billingInfo, name: e.target.value})}
                        className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20" 
                        placeholder="John Doe"
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-2">Email Address</label>
                      <input 
                        type="email" 
                        value={billingInfo.email}
                        onChange={e => setBillingInfo({...billingInfo, email: e.target.value})}
                        className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20" 
                        placeholder="john@example.com"
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-2">Card Number</label>
                      <input 
                        type="text" 
                        className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20" 
                        placeholder="•••• •••• •••• ••••"
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-2">Expiry Date</label>
                         <input type="text" className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm font-bold" placeholder="MM/YY" />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-2">CVC</label>
                         <input type="text" className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm font-bold" placeholder="123" />
                      </div>
                   </div>
                </div>

                <button 
                  onClick={handleSubscribe}
                  disabled={isProcessing}
                  className="w-full py-5 bg-foreground text-background rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Pay ${selectedPlan.price}.00 Securely
                    </>
                  )}
                </button>
                <p className="text-[9px] text-muted-foreground text-center font-medium italic">Your payment is encrypted and processed by Stripe. We do not store your card details.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
