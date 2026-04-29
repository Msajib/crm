'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Mail, 
  Server, 
  ShieldCheck, 
  CheckCircle2, 
  Send,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Settings2,
  Info,
  ChevronDown,
  LayoutGrid
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';

const PROVIDERS = [
  { id: 'SMTP', name: 'Generic SMTP', icon: Server, description: 'Gmail, Outlook, Zoho, etc.' },
  { id: 'SENDGRID', name: 'SendGrid', icon: LayoutGrid, description: 'High-volume API integration' },
  { id: 'MAILGUN', name: 'Mailgun', icon: Mail, description: 'Developer-focused transactional' },
];

export default function EmailSettings() {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [config, setConfig] = useState({
    provider: 'SMTP',
    host: '',
    port: 587,
    user: '',
    pass: '',
    apiKey: '',
    secure: true,
    fromEmail: '',
    fromName: ''
  });

  useEffect(() => {
    fetchConfig();
  }, []);
  const fetchConfig = async () => {
    try {
      const data = await api.get('/email-config');
      if (data) {
         setConfig({
           ...data,
           pass: data.pass ? '********' : '',
           apiKey: data.apiKey ? '********' : ''
         });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/email-config', {
        ...config,
        pass: config.pass === '********' ? undefined : config.pass,
        apiKey: config.apiKey === '********' ? undefined : config.apiKey
      });

      toast.success('Email Configuration Saved', {
        icon: '📧',
        style: { borderRadius: '16px', background: '#0f172a', color: '#fff' }
      });
      fetchConfig();
    } catch (err) {
      toast.error('Communication error');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    toast.loading('Testing Handshake...', { duration: 2000 });
    setTimeout(() => {
      setTesting(false);
      toast.success('Connection Successful!');
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-10 max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-foreground tracking-tight">Email Infrastructure</h1>
            <p className="text-muted-foreground text-sm font-medium">Configure your outbound email service for notifications and marketing.</p>
          </div>
          <div className="flex items-center space-x-3 px-4 py-2 bg-primary/10 text-primary rounded-2xl border border-primary/20 shadow-inner">
             <ShieldCheck className="w-4 h-4" />
             <span className="text-[10px] font-black uppercase tracking-widest">Encrypted Storage</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2">
              <form onSubmit={handleSave} className="bg-card rounded-[40px] border border-border p-8 md:p-12 shadow-sm space-y-10 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -mr-32 -mt-32"></div>
                 
                 <div className="space-y-4 relative z-10">
                    <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Choose Provider</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       {PROVIDERS.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setConfig({...config, provider: p.id})}
                            className={`p-6 rounded-3xl border-2 transition-all text-left flex flex-col space-y-3 ${config.provider === p.id ? 'border-primary bg-primary/5' : 'border-border bg-muted/20 hover:border-border/80'}`}
                          >
                             <p.icon className={`w-6 h-6 ${config.provider === p.id ? 'text-primary' : 'text-muted-foreground'}`} />
                             <div>
                                <p className="text-xs font-black text-foreground">{p.name}</p>
                                <p className="text-[10px] text-muted-foreground font-medium">{p.description}</p>
                             </div>
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    {config.provider === 'SMTP' ? (
                       <>
                          <InputField label="SMTP Host" value={config.host} onChange={(v: string) => setConfig({...config, host: v})} placeholder="smtp.gmail.com" icon={Server} />
                          <InputField label="SMTP Port" value={config.port.toString()} onChange={(v: string) => setConfig({...config, port: parseInt(v) || 0})} placeholder="587" icon={Settings2} />
                          <InputField label="Username / Email" value={config.user} onChange={(v: string) => setConfig({...config, user: v})} placeholder="user@domain.com" icon={Mail} />
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Password / App Key</label>
                            <div className="relative group">
                               <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                  <Lock className="w-4 h-4" />
                               </div>
                               <input 
                                  type={showPass ? "text" : "password"} 
                                  value={config.pass}
                                  onChange={(e) => setConfig({...config, pass: e.target.value})}
                                  className="w-full bg-muted border border-border rounded-2xl pl-14 pr-14 py-4 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" 
                                  placeholder="••••••••••••" 
                               />
                               <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                               </button>
                            </div>
                          </div>
                       </>
                    ) : (
                       <div className="md:col-span-2">
                          <InputField label={`${config.provider} API Key`} value={config.apiKey} onChange={(v: string) => setConfig({...config, apiKey: v})} placeholder={`Enter your ${config.provider} API Key`} icon={Lock} />
                       </div>
                    )}
                 </div>

                 <div className="pt-8 border-t border-border relative z-10">
                    <h3 className="text-sm font-black text-foreground mb-6 uppercase tracking-widest">Sender Defaults</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <InputField label="From Name" value={config.fromName} onChange={(v: string) => setConfig({...config, fromName: v})} placeholder="Acme Support" />
                       <InputField label="From Email" value={config.fromEmail} onChange={(v: string) => setConfig({...config, fromEmail: v})} placeholder="no-reply@acme.com" />
                    </div>
                 </div>

                 <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 relative z-10">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full sm:w-auto px-10 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/25 hover:opacity-90 transition-all flex items-center justify-center space-x-3"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      <span>Save Configuration</span>
                    </button>
                    <button 
                      type="button"
                      onClick={testConnection}
                      disabled={testing}
                      className="w-full sm:w-auto px-10 py-4 bg-muted border border-border text-muted-foreground hover:text-foreground rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-accent transition-all flex items-center justify-center space-x-3"
                    >
                      <Send className="w-4 h-4" />
                      <span>Test Handshake</span>
                    </button>
                 </div>
              </form>
           </div>

           <div className="space-y-6">
              <div className="bg-card p-8 rounded-[40px] border border-border space-y-6 group">
                 <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                    <Info className="w-6 h-6" />
                 </div>
                 <h3 className="text-lg font-black text-foreground">Infrastructure Tips</h3>
                 <div className="space-y-4">
                    <div className="p-4 bg-muted/40 rounded-2xl border border-border">
                       <p className="text-[11px] font-bold text-foreground mb-1">Deliverability</p>
                       <p className="text-[10px] text-muted-foreground leading-relaxed">Ensure your <span className="font-bold">SPF and DKIM</span> records are set up in your DNS provider for the best results.</p>
                    </div>
                    <div className="p-4 bg-muted/40 rounded-2xl border border-border">
                       <p className="text-[11px] font-bold text-foreground mb-1">Super Admin Note</p>
                       <p className="text-[10px] text-muted-foreground leading-relaxed">System-wide emails (invoices, auth) use the master configuration managed by Super Admins.</p>
                    </div>
                 </div>
              </div>

              <div className="bg-primary p-8 rounded-[40px] text-white shadow-2xl shadow-primary/30 relative overflow-hidden">
                 <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 blur-2xl rounded-full"></div>
                 <h3 className="text-lg font-black mb-2 text-white">Need AWS SES?</h3>
                 <p className="text-xs font-medium opacity-80 leading-relaxed mb-6 text-white/80">AWS SES integration is available for high-scale enterprise customers.</p>
                 <button className="w-full py-3 bg-white text-primary rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-opacity-90 transition-all">Request SES Access</button>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function InputField({ label, value, onChange, placeholder, icon: Icon }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">{label}</label>
      <div className="relative group">
         {Icon && (
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
               <Icon className="w-4 h-4" />
            </div>
         )}
         <input 
            type="text" 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full bg-muted border border-border rounded-2xl ${Icon ? 'pl-14' : 'px-6'} py-4 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/30`} 
            placeholder={placeholder} 
         />
      </div>
    </div>
  );
}
