'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/components/DashboardLayout';

export default function CustomDomainSettings() {
  const [loading, setLoading] = useState(false);
  const [domain, setDomain] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = async () => {
    if (!domain) return toast.error('Please enter a domain');
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsVerified(true);
      toast.success('Domain verified successfully!');
    } catch (error) {
      toast.error('Verification failed. Check your DNS records.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">Custom Domain</h1>
          <p className="text-muted-foreground">Connect your own domain to provide a white-labeled experience for your clients.</p>
        </header>

        <div className="space-y-8">
          {/* Subdomain Info */}
          <section className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-border rounded-3xl p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary font-semibold mb-1">Your Subdomain</p>
                <h2 className="text-2xl font-mono text-foreground">acme-corp.crmplatform.com</h2>
              </div>
              <div className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-full text-xs font-bold border border-emerald-500/30">
                ACTIVE
              </div>
            </div>
          </section>

          {/* Custom Domain Form */}
          <section className="glass-premium border border-border rounded-3xl p-8 shadow-2xl">
            <h3 className="text-xl font-semibold mb-6 text-foreground">Connect Custom Domain</h3>
            
            <div className="space-y-6">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="crm.yourdomain.com"
                    className="w-full bg-background border border-border rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
                  />
                </div>
                <button
                  onClick={handleVerify}
                  disabled={loading || isVerified}
                  className="px-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl font-bold transition-all disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : isVerified ? 'Connected' : 'Connect'}
                </button>
              </div>

              {domain && !isVerified && (
                <div className="animate-fade-in bg-muted/50 border border-border rounded-2xl p-6 space-y-4">
                  <p className="text-sm text-muted-foreground">Please add the following DNS records to your domain provider:</p>
                  <div className="grid grid-cols-3 gap-4 text-xs font-mono">
                    <div className="text-muted-foreground uppercase tracking-wider">Type</div>
                    <div className="text-muted-foreground uppercase tracking-wider">Host</div>
                    <div className="text-muted-foreground uppercase tracking-wider">Value</div>
                    
                    <div className="bg-background p-2 rounded border border-border">CNAME</div>
                    <div className="bg-background p-2 rounded border border-border">crm</div>
                    <div className="bg-background p-2 rounded border border-border">proxy.crmplatform.com</div>
                  </div>
                </div>
              )}

              {isVerified && (
                <div className="flex items-center space-x-3 text-emerald-400 bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  <span className="text-sm font-medium">SSL Certificate is being provisioned. This may take up to 24 hours.</span>
                </div>
              )}
            </div>
          </section>

          {/* Help/Instruction */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="glass-premium p-6 rounded-3xl border border-border">
                <h4 className="font-semibold mb-2 text-foreground">A Record Method</h4>
                <p className="text-xs text-muted-foreground mb-4">If you want to use a root domain (e.g. acmecrm.com), point your A record to:</p>
                <code className="bg-muted p-2 rounded text-primary text-sm block text-center border border-border">76.76.21.21</code>
             </div>
             <div className="glass-premium p-6 rounded-3xl border border-border">
                <h4 className="font-semibold mb-2 text-foreground">Cloudflare Users</h4>
                <p className="text-xs text-muted-foreground">Ensure 'Proxy' is turned OFF (Grey cloud) during the verification process.</p>
             </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
