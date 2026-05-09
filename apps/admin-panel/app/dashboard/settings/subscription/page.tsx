'use client';

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { CreditCard, CheckCircle, Zap, Shield, ArrowRight, Building } from 'lucide-react';
import { api } from '@/lib/api';

const PLANS = [
  {
    name: 'Starter',
    price: '$29',
    description: 'Perfect for small teams and startups.',
    features: ['Up to 5 Users', '1,000 Contacts', 'Basic AI Assistance', 'Email Support'],
    current: false,
  },
  {
    name: 'Professional',
    price: '$99',
    description: 'Advanced tools for growing businesses.',
    features: ['Up to 20 Users', '10,000 Contacts', 'Full AI Sales Agent', 'Priority Support', 'Custom Branding'],
    current: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Scalable solutions for large organizations.',
    features: ['Unlimited Users', 'Unlimited Contacts', 'Dedicated Account Manager', 'Custom Integrations', 'SLA Guarantee'],
    current: false,
  }
];

export default function SubscriptionPage() {
  const [invoices, setInvoices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await api.get('/payments/invoices/tenant');
        if (Array.isArray(response)) {
          setInvoices(response);
        }
      } catch (err) {
        console.error('Failed to fetch invoices:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-12">
        <header>
          <h1 className="text-2xl font-black text-foreground mb-2 text-gradient">Subscription & Billing</h1>
          <p className="text-muted-foreground font-medium italic">Manage your workspace capacity and billing details.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`glass-premium p-10 rounded-[48px] border transition-all relative overflow-hidden ${plan.current ? 'border-primary shadow-2xl shadow-primary/10' : 'border-border'}`}>
              {plan.current && (
                <div className="absolute top-0 right-0 bg-primary text-white px-6 py-2 rounded-bl-3xl text-[10px] font-black uppercase tracking-widest">
                  Current Plan
                </div>
              )}
              
              <h2 className="text-xl font-black text-foreground mb-1">{plan.name}</h2>
              <p className="text-xs text-muted-foreground font-medium mb-6">{plan.description}</p>
              
              <div className="flex items-end gap-1 mb-8">
                <span className="text-4xl font-black text-foreground">{plan.price}</span>
                {plan.price !== 'Custom' && <span className="text-sm text-muted-foreground mb-1">/mo</span>}
              </div>

              <div className="space-y-4 mb-10">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <button className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${plan.current ? 'bg-muted text-muted-foreground cursor-default' : 'bg-primary text-white shadow-xl shadow-primary/20 hover:opacity-90'}`}>
                {plan.current ? 'Your Current Plan' : 'Upgrade Now'}
              </button>
            </div>
          ))}
        </div>

        <div className="glass-premium p-10 rounded-[48px] border border-border flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-muted rounded-3xl flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-base font-black text-foreground">Payment Method</h3>
              <p className="text-xs text-muted-foreground font-medium">Visa ending in 4242 • Expires 12/28</p>
            </div>
          </div>
          <button className="px-8 py-4 bg-muted text-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-accent transition-all">
            Update Method
          </button>
        </div>

        <section className="space-y-6 pb-20">
           <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-foreground">Billing History</h2>
              <button onClick={() => window.print()} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Download All Receipts</button>
           </div>
           <div className="glass-premium rounded-[40px] border border-border overflow-hidden premium-shadow">
              <table className="w-full text-left">
                 <thead className="bg-muted/50 border-b border-border">
                    <tr>
                       <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Description</th>
                       <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Date</th>
                       <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Amount</th>
                       <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                       <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Invoice</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-border/50">
                    {loading ? (
                      <tr><td colSpan={5} className="px-8 py-10 text-center text-muted-foreground animate-pulse">Retrieving records...</td></tr>
                    ) : invoices.length === 0 ? (
                      <tr><td colSpan={5} className="px-8 py-10 text-center text-muted-foreground font-bold">No payment records found.</td></tr>
                    ) : (
                      invoices.map((inv) => (
                        <InvoiceRow 
                          key={inv.id}
                          plan={inv.planName} 
                          date={new Date(inv.createdAt).toLocaleDateString()} 
                          amount={`$${inv.amount}`} 
                          status={inv.status} 
                        />
                      ))
                    )}
                 </tbody>
              </table>
           </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

function InvoiceRow({ plan, date, amount, status }: any) {
   return (
      <tr className="hover:bg-primary/5 transition-all group">
         <td className="px-8 py-6">
            <p className="text-sm font-black text-foreground">{plan}</p>
            <p className="text-[10px] text-muted-foreground">Monthly subscription</p>
         </td>
         <td className="px-8 py-6 text-sm font-medium text-muted-foreground">{date}</td>
         <td className="px-8 py-6 text-sm font-black text-foreground">{amount}</td>
         <td className="px-8 py-6">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase">
               {status}
            </span>
         </td>
         <td className="px-8 py-6 text-right">
            <button className="p-3 bg-muted rounded-xl hover:bg-primary hover:text-white transition-all">
               <ArrowRight className="w-4 h-4" />
            </button>
         </td>
      </tr>
   );
}
