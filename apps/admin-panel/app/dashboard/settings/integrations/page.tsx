'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  Share2, 
  ShieldCheck, 
  Save, 
  Key, 
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function IntegrationSettings() {
  const [config, setConfig] = useState({
    twilioSid: '',
    twilioToken: '',
    sendgridKey: '',
    whatsappKey: '',
    metaAppId: '',
    metaSecret: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem('crm_integrations_config');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse integrations config');
      }
    }
  }, []);

  const saveConfig = (service: string) => {
    localStorage.setItem('crm_integrations_config', JSON.stringify(config));
    toast.success(`${service} configuration updated successfully!`);
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-10 pb-20">
        <header>
          <h1 className="text-3xl font-black text-foreground mb-2 text-gradient">API & Integrations</h1>
          <p className="text-muted-foreground text-sm">Connect your professional service providers to activate communication and marketing modules.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* VoIP & SMS */}
           <section className="glass-premium p-8 rounded-[40px] border border-border flex flex-col justify-between">
              <div>
                 <div className="flex items-center space-x-3 mb-8">
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center">
                       <Phone className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Twilio (Voice & SMS)</h2>
                 </div>
                 
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Account SID</label>
                       <input 
                          type="password" 
                          value={config.twilioSid}
                          onChange={(e) => setConfig({...config, twilioSid: e.target.value})}
                          placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                          className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Auth Token</label>
                       <input 
                          type="password" 
                          value={config.twilioToken}
                          onChange={(e) => setConfig({...config, twilioToken: e.target.value})}
                          placeholder="••••••••••••••••••••••••••••••••"
                          className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none"
                       />
                    </div>
                 </div>
              </div>
              <button 
                 onClick={() => saveConfig('Twilio')}
                 className="mt-10 w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
              >
                 <Save className="w-4 h-4" />
                 <span>Save Twilio Config</span>
              </button>
           </section>

           {/* Email Service */}
           <section className="glass-premium p-8 rounded-[40px] border border-border flex flex-col justify-between">
              <div>
                 <div className="flex items-center space-x-3 mb-8">
                    <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center">
                       <Mail className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">SendGrid (Email)</h2>
                 </div>
                 
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">SendGrid API Key</label>
                       <input 
                          type="password" 
                          value={config.sendgridKey}
                          onChange={(e) => setConfig({...config, sendgridKey: e.target.value})}
                          placeholder="SG.xxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxx"
                          className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
                       />
                    </div>
                    <p className="text-[10px] text-muted-foreground italic">Required for transactional emails, campaigns, and inbox synchronization.</p>
                 </div>
              </div>
              <button 
                 onClick={() => saveConfig('SendGrid')}
                 className="mt-10 w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-2"
              >
                 <Save className="w-4 h-4" />
                 <span>Save Email Config</span>
              </button>
           </section>

           {/* Social Marketing */}
           <section className="glass-premium p-8 rounded-[40px] border border-border flex flex-col justify-between">
              <div>
                 <div className="flex items-center space-x-3 mb-8">
                    <div className="w-12 h-12 bg-pink-500/10 text-pink-500 rounded-2xl flex items-center justify-center">
                       <Share2 className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Meta Graph API (FB/IG)</h2>
                 </div>
                 
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Meta App ID</label>
                       <input 
                          type="text" 
                          value={config.metaAppId}
                          onChange={(e) => setConfig({...config, metaAppId: e.target.value})}
                          placeholder="Enter your Facebook App ID"
                          className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-pink-500/50 outline-none"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">App Secret</label>
                       <input 
                          type="password" 
                          value={config.metaSecret}
                          onChange={(e) => setConfig({...config, metaSecret: e.target.value})}
                          placeholder="••••••••••••••••"
                          className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-pink-500/50 outline-none"
                       />
                    </div>
                 </div>
              </div>
              <button 
                 onClick={() => saveConfig('Meta')}
                 className="mt-10 w-full py-4 bg-pink-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-pink-700 transition-all shadow-lg shadow-pink-500/20 flex items-center justify-center space-x-2"
              >
                 <Save className="w-4 h-4" />
                 <span>Save Meta Config</span>
              </button>
           </section>

           {/* WhatsApp Business */}
           <section className="glass-premium p-8 rounded-[40px] border border-border flex flex-col justify-between">
              <div>
                 <div className="flex items-center space-x-3 mb-8">
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center">
                       <Smartphone className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">WhatsApp Business</h2>
                 </div>
                 
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">WhatsApp Access Token</label>
                       <input 
                          type="password" 
                          value={config.whatsappKey}
                          onChange={(e) => setConfig({...config, whatsappKey: e.target.value})}
                          placeholder="EAABxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                          className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none"
                       />
                    </div>
                    <div className="flex items-center space-x-2 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                       <ShieldCheck className="w-5 h-5 text-emerald-500" />
                       <p className="text-[10px] text-muted-foreground font-medium">System will automatically verify and sync templates once token is saved.</p>
                    </div>
                 </div>
              </div>
              <button 
                 onClick={() => saveConfig('WhatsApp')}
                 className="mt-10 w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
              >
                 <Save className="w-4 h-4" />
                 <span>Save WhatsApp Config</span>
              </button>
           </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
