'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
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
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldAlert,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ModuleGuard from '@/components/ModuleGuard';

const INITIAL_GATEWAYS = [
  { id: 'stripe', name: 'Stripe', description: 'Global payments, credit cards, and digital wallets.', status: 'CONNECTED', icon: CreditCard, color: 'text-blue-500 bg-blue-500/10' },
  { id: 'paypal', name: 'PayPal', description: 'Trusted worldwide for secure wallet payments.', status: 'NOT_CONNECTED', icon: Wallet, color: 'text-indigo-500 bg-indigo-500/10' },
  { id: 'sslcommerz', name: 'SSLCommerz', description: 'The leading payment aggregator in Bangladesh.', status: 'NOT_CONNECTED', icon: LockKeyhole, color: 'text-rose-500 bg-rose-500/10' },
  { id: 'bkash', name: 'bKash', description: 'Direct MFS integration for instant settlements.', status: 'NOT_CONNECTED', icon: Building2, color: 'text-pink-500 bg-pink-500/10' },
];

export default function PaymentSettings() {
  return (
    <ModuleGuard moduleId="payments">
      <PaymentContent />
    </ModuleGuard>
  );
}

function PaymentContent() {
  const [loading, setLoading] = useState<string | null>(null);
  const [gateways, setGateways] = useState(INITIAL_GATEWAYS);
  const [settingsModal, setSettingsModal] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  
  // State for expanded credentials
  const [credentials, setCredentials] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const data = await api.get('/payments/configs');
      if (Array.isArray(data)) {
        setGateways(prev => prev.map(g => {
          const config = data.find((c: any) => c.gateway === g.id.toUpperCase());
          return config ? { ...g, status: 'CONNECTED' } : g;
        }));
        
        // Map settings back to credentials state
        const newCreds: Record<string, any> = {};
        data.forEach((c: any) => {
          const gid = c.gateway.toLowerCase();
          newCreds[gid] = {
            publicKey: c.publicKey,
            secretKey: '********', // Don't show actual secret
            ...(c.settings || {})
          };
        });
        setCredentials(newCreds);
      }
    } catch (err) {}
  };

  const handleSaveConfig = async () => {
    if (!settingsModal) return;
    
    const current = credentials[settingsModal];
    if (!current?.publicKey || !current?.secretKey) {
      toast.error('Essential API keys are required.');
      return;
    }

    try {
      await api.post('/payments/config', {
        gateway: settingsModal,
        publicKey: current.publicKey,
        secretKey: current.secretKey === '********' ? undefined : current.secretKey, // Don't overwrite if not changed
        settings: {
          ...current,
          publicKey: undefined,
          secretKey: undefined
        }
      });

      toast.success(`${settingsModal.toUpperCase()} configuration secured!`, {
          icon: '🔐',
          style: { borderRadius: '16px', background: '#0f172a', color: '#fff' }
      });
      setSettingsModal(null);
      fetchConfigs();
    } catch (err) {
      toast.error('Configuration synchronization failed.');
    }
  };

  const updateField = (id: string, field: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value
      }
    }));
  };

  const renderConfigFields = (id: string) => {
    switch (id) {
      case 'stripe':
        return (
          <>
            <ConfigField label="Publishable Key" field="publicKey" id={id} placeholder="pk_live_..." value={credentials[id]?.publicKey} onChange={updateField} />
            <ConfigField label="Secret Key" field="secretKey" id={id} placeholder="sk_live_..." value={credentials[id]?.secretKey} onChange={updateField} secret />
            <ConfigField label="Webhook Secret" field="webhookSecret" id={id} placeholder="whsec_..." value={credentials[id]?.webhookSecret} onChange={updateField} secret />
            <ConfigSelect label="Environment" field="mode" id={id} options={['test', 'live']} value={credentials[id]?.mode || 'test'} onChange={updateField} />
          </>
        );
      case 'paypal':
        return (
          <>
            <ConfigField label="Client ID" field="publicKey" id={id} placeholder="Enter PayPal Client ID" value={credentials[id]?.publicKey} onChange={updateField} />
            <ConfigField label="Secret Key" field="secretKey" id={id} placeholder="Enter PayPal Secret" value={credentials[id]?.secretKey} onChange={updateField} secret />
            <ConfigField label="Webhook ID" field="webhookId" id={id} placeholder="Enter Webhook ID" value={credentials[id]?.webhookId} onChange={updateField} />
            <ConfigSelect label="Environment" field="mode" id={id} options={['sandbox', 'live']} value={credentials[id]?.mode || 'sandbox'} onChange={updateField} />
          </>
        );
      case 'sslcommerz':
        return (
          <>
            <ConfigField label="Store ID" field="publicKey" id={id} placeholder="Enter Store ID" value={credentials[id]?.publicKey} onChange={updateField} />
            <ConfigField label="Store Password" field="secretKey" id={id} placeholder="Enter Store Password" value={credentials[id]?.secretKey} onChange={updateField} secret />
            <ConfigSelect label="Environment" field="mode" id={id} options={['sandbox', 'live']} value={credentials[id]?.mode || 'sandbox'} onChange={updateField} />
          </>
        );
      case 'bkash':
        return (
          <>
            <ConfigField label="App Key" field="publicKey" id={id} placeholder="Enter bKash App Key" value={credentials[id]?.publicKey} onChange={updateField} />
            <ConfigField label="App Secret" field="secretKey" id={id} placeholder="Enter bKash App Secret" value={credentials[id]?.secretKey} onChange={updateField} secret />
            <ConfigField label="Username" field="username" id={id} placeholder="Enter bKash Username" value={credentials[id]?.username} onChange={updateField} />
            <ConfigField label="Password" field="password" id={id} placeholder="Enter bKash Password" value={credentials[id]?.password} onChange={updateField} secret />
            <ConfigSelect label="Environment" field="mode" id={id} options={['sandbox', 'live']} value={credentials[id]?.mode || 'sandbox'} onChange={updateField} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-10 max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-foreground tracking-tight">Financial Infrastructure</h1>
            <p className="text-muted-foreground text-sm font-medium max-w-2xl">Connect enterprise-grade payment gateways to scale your global revenue operations.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="text-[9px] font-black uppercase tracking-widest">PCI-DSS Compliant</span>
             </div>
             <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20">
                <Lock className="w-3.5 h-3.5" />
                <span className="text-[9px] font-black uppercase tracking-widest">SSL Encrypted</span>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
           <div className="xl:col-span-2 space-y-5">
              {gateways.map((gateway) => (
                 <div key={gateway.id} className="bg-card p-8 rounded-[32px] border border-border flex flex-col md:flex-row items-center justify-between group hover:border-primary/40 transition-all shadow-sm relative overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 relative z-10">
                       <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all group-hover:scale-105 duration-500 ${gateway.color}`}>
                          <gateway.icon className="w-8 h-8" />
                       </div>
                       <div className="text-center md:text-left">
                          <div className="flex items-center justify-center md:justify-start space-x-2 mb-1">
                             <h3 className="text-lg font-black text-foreground">{gateway.name}</h3>
                             {gateway.status === 'CONNECTED' ? (
                                <span className="flex items-center space-x-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">
                                   <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                                   <span>Active</span>
                                </span>
                             ) : (
                                <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-[8px] font-black uppercase tracking-widest border border-border">Inactive</span>
                             )}
                          </div>
                          <p className="text-xs text-muted-foreground max-w-sm font-medium">{gateway.description}</p>
                       </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-6 md:mt-0 relative z-10 w-full md:w-auto">
                       <button 
                          onClick={() => setSettingsModal(gateway.id)} 
                          className="flex-1 md:flex-none p-3.5 bg-muted hover:bg-accent rounded-xl text-muted-foreground hover:text-foreground transition-all border border-border"
                       >
                          <Settings className="w-5 h-5" />
                       </button>
                       {gateway.status === 'CONNECTED' ? (
                          <button className="flex-[2] md:flex-none px-6 py-3.5 bg-red-500/5 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-500/20">
                             Disconnect
                          </button>
                       ) : (
                          <button 
                             onClick={() => setSettingsModal(gateway.id)}
                             className="w-full md:w-auto px-8 py-3.5 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                          >
                             Configure
                          </button>
                       )}
                    </div>
                 </div>
              ))}
           </div>

           <aside className="space-y-6">
              <div className="bg-card p-8 rounded-[32px] border border-border bg-gradient-to-br from-card to-primary/5 relative overflow-hidden group">
                 <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 border border-primary/20">
                    <ShieldCheck className="w-6 h-6" />
                 </div>
                 <h3 className="text-lg font-black text-foreground mb-3">Security Protocols</h3>
                 <p className="text-xs text-muted-foreground leading-relaxed mb-6 font-medium">
                    Sensitive keys are encrypted at rest using AES-256 and decrypted only in the ephemeral memory of the payment microservice.
                 </p>
                 <button className="flex items-center space-x-2 text-[9px] font-black text-primary uppercase tracking-widest hover:underline">
                    <span>Audit Documentation</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                 </button>
              </div>

              <div className="bg-card p-8 rounded-[32px] border border-border space-y-6">
                 <h3 className="text-base font-black text-foreground">Global Controls</h3>
                 <div className="space-y-3">
                    <div className="p-4 bg-muted/30 rounded-xl border border-border flex justify-between items-center">
                       <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Base Currency</span>
                       <span className="text-xs font-black text-foreground">USD ($)</span>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-xl border border-border flex justify-between items-center">
                       <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Tax Inclusion</span>
                       <span className="text-xs font-black text-emerald-500">15% VAT</span>
                    </div>
                 </div>
              </div>
           </aside>
        </div>
      </div>

      {/* Settings Modal */}
      {settingsModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-xl rounded-[40px] border border-border shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
            
            <div className="p-8 md:p-10 border-b border-border flex justify-between items-center">
               <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <LockKeyhole className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-foreground capitalize">{settingsModal} Setup</h2>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Production Credentials</p>
                  </div>
               </div>
               <button onClick={() => setSettingsModal(null)} className="p-2.5 hover:bg-muted rounded-xl transition-all text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar space-y-8 flex-1">
               {/* Guide Toggle */}
               <button 
                 onClick={() => setShowGuide(!showGuide)}
                 className="w-full p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between group transition-all"
               >
                  <div className="flex items-center space-x-3">
                     <Info className="w-4 h-4 text-primary" />
                     <span className="text-[10px] font-black text-primary uppercase tracking-widest">How to get {settingsModal} credentials?</span>
                  </div>
                  {showGuide ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-primary" />}
               </button>

               {showGuide && (
                  <div className="p-6 bg-muted/40 rounded-2xl border border-border text-[11px] text-muted-foreground leading-relaxed animate-in slide-in-from-top-2 duration-200">
                     <p className="font-bold text-foreground mb-2">Instructions:</p>
                     {settingsModal === 'stripe' && (
                        <ul className="list-disc pl-4 space-y-2">
                           <li>Log in to your <span className="text-primary font-bold">Stripe Dashboard</span>.</li>
                           <li>Go to <span className="font-bold">Developers &gt; API keys</span>.</li>
                           <li>Copy the <span className="font-bold">Publishable key</span> and <span className="font-bold">Secret key</span>.</li>
                           <li>For webhooks, go to <span className="font-bold">Webhooks</span> and click 'Add endpoint'.</li>
                        </ul>
                     )}
                     {settingsModal === 'paypal' && (
                        <ul className="list-disc pl-4 space-y-2">
                           <li>Go to the <span className="text-primary font-bold">PayPal Developer Portal</span>.</li>
                           <li>Navigate to <span className="font-bold">Apps &amp; Credentials</span>.</li>
                           <li>Create a new App to get your <span className="font-bold">Client ID</span> and <span className="font-bold">Secret</span>.</li>
                        </ul>
                     )}
                     {settingsModal === 'bkash' && (
                        <ul className="list-disc pl-4 space-y-2">
                           <li>Apply for a <span className="text-primary font-bold">bKash Merchant Account</span>.</li>
                           <li>Once approved, bKash will provide your <span className="font-bold">App Key</span>, <span className="font-bold">App Secret</span>, and credentials via email.</li>
                        </ul>
                     )}
                     {!['stripe', 'paypal', 'bkash'].includes(settingsModal) && (
                        <p>Please refer to the official developer documentation for {settingsModal} to obtain your integration keys.</p>
                     )}
                  </div>
               )}

               <div className="space-y-6">
                  {renderConfigFields(settingsModal)}
               </div>
            </div>

            <div className="p-8 md:p-10 border-t border-border bg-muted/20">
               <button 
                 onClick={handleSaveConfig} 
                 className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center space-x-3"
               >
                 <CheckCircle2 className="w-5 h-5" />
                 <span>Save Configuration</span>
               </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function ConfigField({ label, field, id, placeholder, value, onChange, secret = false }: any) {
  const [show, setShow] = useState(!secret);
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</label>
      </div>
      <div className="relative group">
         <input 
            type={show ? "text" : "password"} 
            value={value || ''}
            onChange={(e) => onChange(id, field, e.target.value)}
            className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/30" 
            placeholder={placeholder} 
         />
         {secret && (
            <button 
               type="button"
               onClick={() => setShow(!show)}
               className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
            >
               {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
         )}
      </div>
    </div>
  );
}

function ConfigSelect({ label, field, id, options, value, onChange }: any) {
   return (
      <div className="space-y-2">
         <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">{label}</label>
         <select 
            value={value}
            onChange={(e) => onChange(id, field, e.target.value)}
            className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all capitalize"
         >
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
         </select>
      </div>
   );
}
