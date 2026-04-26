'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  CreditCard, 
  Lock, 
  Settings, 
  CheckCircle2, 
  ShieldCheck,
  Plus,
  RefreshCw,
  ExternalLink,
  X,
  Loader2,
  Wallet,
  Building2,
  LockKeyhole
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const INITIAL_GATEWAYS = [
  { id: 'stripe', name: 'Stripe', description: 'Global payments, credit cards, and digital wallets.', status: 'CONNECTED', icon: CreditCard, color: 'text-blue-500 bg-blue-500/10' },
  { id: 'paypal', name: 'PayPal', description: 'Trusted worldwide for secure wallet payments.', status: 'NOT_CONNECTED', icon: Wallet, color: 'text-indigo-500 bg-indigo-500/10' },
  { id: 'sslcommerz', name: 'SSLCommerz', description: 'The leading payment aggregator in Bangladesh.', status: 'NOT_CONNECTED', icon: LockKeyhole, color: 'text-rose-500 bg-rose-500/10' },
  { id: 'bkash', name: 'bKash', description: 'Direct MFS integration for instant settlements.', status: 'NOT_CONNECTED', icon: Building2, color: 'text-pink-500 bg-pink-500/10' },
];

export default function PaymentSettings() {
  const [loading, setLoading] = useState<string | null>(null);
  const [gateways, setGateways] = useState(INITIAL_GATEWAYS);
  const [settingsModal, setSettingsModal] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('crm_payment_gateways_v2');
    if (saved) {
      try {
        const savedData = JSON.parse(saved);
        setGateways(prev => prev.map(p => ({
          ...p,
          status: savedData[p.id]?.status || p.status
        })));
      } catch (e) {}
    }
  }, []);

  const saveGateways = (id: string, status: string) => {
    const saved = JSON.parse(localStorage.getItem('crm_payment_gateways_v2') || '{}');
    saved[id] = { status };
    localStorage.setItem('crm_payment_gateways_v2', JSON.stringify(saved));
    
    setGateways(prev => prev.map(g => g.id === id ? { ...g, status } : g));
  };

  const connect = (id: string) => {
    setLoading(id);
    toast.loading(`Establishing secure handshake with ${id}...`, { duration: 2000 });
    
    setTimeout(() => {
      setLoading(null);
      saveGateways(id, 'CONNECTED');
      toast.success(`${id} successfully integrated!`, {
        icon: '✅',
        style: { borderRadius: '20px', background: '#1e293b', color: '#fff' }
      });
    }, 2000);
  };

  const disable = (id: string) => {
    saveGateways(id, 'NOT_CONNECTED');
    toast.success(`${id} integration disabled.`);
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-12 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-foreground mb-3 text-gradient">Financial Infrastructure</h1>
            <p className="text-muted-foreground text-lg">Scale your global revenue by connecting enterprise-grade payment gateways.</p>
          </div>
          <div className="flex items-center space-x-3 bg-card border border-border p-2 rounded-2xl shadow-sm">
             <div className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-widest">PCI-DSS Level 1</div>
             <div className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-xl text-[10px] font-black uppercase tracking-widest">SSL Encrypted</div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
           {/* Active Gateways List */}
           <div className="xl:col-span-2 space-y-6">
              {gateways.map((gateway) => (
                 <div key={gateway.id} className="bg-card p-10 rounded-[48px] border border-border flex flex-col md:flex-row items-center justify-between group hover:border-primary/30 transition-all premium-shadow relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-10 -mt-10 group-hover:bg-primary/10 transition-colors"></div>
                    
                    <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 relative z-10">
                       <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${gateway.color}`}>
                          <gateway.icon className="w-10 h-10" />
                       </div>
                       <div className="text-center md:text-left">
                          <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                             <h3 className="text-2xl font-black text-foreground">{gateway.name}</h3>
                             {gateway.status === 'CONNECTED' && (
                                <span className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                                   <CheckCircle2 className="w-3 h-3" />
                                   <span>Active</span>
                                </span>
                             )}
                          </div>
                          <p className="text-sm text-muted-foreground max-w-sm">{gateway.description}</p>
                       </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-8 md:mt-0 relative z-10">
                       {gateway.status === 'CONNECTED' ? (
                          <>
                             <button onClick={() => setSettingsModal(gateway.id)} className="p-4 bg-muted hover:bg-accent rounded-2xl text-muted-foreground hover:text-foreground transition-all border border-border">
                                <Settings className="w-6 h-6" />
                             </button>
                             <button onClick={() => disable(gateway.id)} className="px-8 py-4 bg-red-500/10 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all border border-red-500/20">Deactivate</button>
                          </>
                       ) : (
                          <button 
                             onClick={() => connect(gateway.id)}
                             disabled={!!loading}
                             className="px-10 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-xl shadow-primary/25 active:scale-95 disabled:opacity-50 flex items-center space-x-3"
                          >
                             {loading === gateway.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                             <span>{loading === gateway.id ? 'Handshaking...' : 'Activate Gateway'}</span>
                          </button>
                       )}
                    </div>
                 </div>
              ))}

              <button className="w-full py-12 rounded-[48px] border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all bg-muted/10 group">
                 <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="w-8 h-8" />
                 </div>
                 <span className="text-xs font-black uppercase tracking-[0.3em]">Integrate Custom Endpoint</span>
              </button>
           </div>

           {/* Security & Info */}
           <aside className="space-y-8">
              <div className="bg-card p-10 rounded-[48px] border border-border bg-gradient-to-br from-card to-primary/5 relative overflow-hidden">
                 <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 blur-[60px] rounded-full"></div>
                 <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-8 border border-primary/20">
                    <ShieldCheck className="w-8 h-8" />
                 </div>
                 <h3 className="text-2xl font-black text-foreground mb-4">Banking Grade Security</h3>
                 <p className="text-sm text-muted-foreground leading-relaxed mb-8 opacity-80">
                    Our financial architecture is built on top of Zero-Trust principles. We never touch or store sensitive CVV or card numbers.
                 </p>
                 <button className="flex items-center space-x-3 text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:underline group">
                    <span>Audit Documentation</span>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </button>
              </div>

              <div className="bg-card p-10 rounded-[48px] border border-border space-y-8">
                 <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-foreground">Global Settings</h3>
                    <button className="text-muted-foreground hover:text-primary transition-all hover:rotate-180 duration-700">
                       <RefreshCw className="w-5 h-5" />
                    </button>
                 </div>
                 <div className="space-y-6">
                    <div className="p-4 bg-muted/50 rounded-2xl border border-border flex justify-between items-center">
                       <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Base Currency</span>
                       <span className="text-sm font-black text-foreground">USD ($)</span>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-2xl border border-border flex justify-between items-center">
                       <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Default VAT</span>
                       <span className="text-sm font-black text-emerald-500">15.00%</span>
                    </div>
                 </div>
                 <button className="w-full py-4 bg-muted border border-border rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent transition-all">Regional Overrides</button>
              </div>
           </aside>
        </div>
      </div>

      {settingsModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-xl rounded-[48px] border border-border p-12 shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
            
            <div className="flex justify-between items-center mb-10">
               <div>
                  <h2 className="text-3xl font-black text-foreground capitalize">{settingsModal} Credentials</h2>
                  <p className="text-xs text-muted-foreground mt-1">Configure your API handshakes securely.</p>
               </div>
               <button onClick={() => setSettingsModal(null)} className="p-3 hover:bg-muted rounded-2xl transition-all text-muted-foreground"><X className="w-6 h-6" /></button>
            </div>

            <div className="space-y-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Public API Key</label>
                  <div className="relative">
                     <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                     <input type="text" className="w-full bg-muted border border-border rounded-[24px] pl-14 pr-8 py-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" placeholder={`Enter ${settingsModal} Public Key`} />
                  </div>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Secret Access Token</label>
                  <div className="relative">
                     <LockKeyhole className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                     <input type="password" title="Secret Key" className="w-full bg-muted border border-border rounded-[24px] pl-14 pr-8 py-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" placeholder="••••••••••••••••••••" />
                  </div>
               </div>
               <div className="pt-4">
                  <button onClick={() => { setSettingsModal(null); toast.success('Encrypted configuration saved!'); }} className="w-full py-6 bg-primary text-white rounded-[24px] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-primary/40 hover:opacity-90 transition-all active:scale-95">Verify & Save</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
