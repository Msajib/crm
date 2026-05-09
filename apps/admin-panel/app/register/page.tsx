'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { PasswordField } from '@/components/ui/PasswordField';
import { Zap, Users, BarChart3, Shield, Check, Loader2, Github, Linkedin, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const FEATURES = [
  { icon: Users, title: 'Team Collaboration', text: 'Unlimited contacts & lead management' },
  { icon: BarChart3, title: 'Deep Insights', text: 'AI-powered sales insights & analytics' },
  { icon: Zap, title: 'Workflow Automation', text: 'Campaign & workflow automation engine' },
  { icon: Shield, title: 'Enterprise Security', text: 'Role-based access control for teams' },
];

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', organization: '',
    size: '', industry: '', password: '',
  });
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [ssoProviders, setSsoProviders] = useState({ google: true, github: true, linkedin: false, microsoft: false });

  React.useEffect(() => {
    const saved = localStorage.getItem('crm_sso_providers');
    if (saved) setSsoProviders(JSON.parse(saved));
  }, []);

  const set = (key: string, val: string) => {
    setForm(f => ({ ...f, [key]: val }));
    if (key === 'password') {
      calculateStrength(val);
    }
  };

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (!pass) return setPasswordStrength(0);
    if (pass.length > 7) score += 1;
    if (pass.length > 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    setPasswordStrength(Math.min(5, score));
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-amber-500';
    return 'bg-emerald-500';
  };
  const getStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 3) return 'Good';
    return 'Strong';
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Front-end validation checks
    if (!form.name || !form.email || !form.organization || !form.phone || !form.size || !form.industry) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    const tid = toast.loading('Creating your workspace…');

    try {
      const [firstName, ...rest] = form.name.trim().split(' ');
      const lastName = rest.join(' ') || 'User';

      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email: form.email, phone: form.phone, password: form.password }),
      });

      const regText = await regRes.text();
      let regData: any;
      try { regData = JSON.parse(regText); }
      catch { throw new Error(`Server error (${regRes.status}). Please try again.`); }

      if (!regRes.ok) {
        const msg = Array.isArray(regData?.message) ? regData.message.join(', ') : (regData?.message || `Error ${regRes.status}`);
        throw new Error(msg);
      }

      const { accessToken, refreshToken, user } = regData;

      document.cookie = `token=${accessToken}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `role=${user.role}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `permissions=${JSON.stringify(user.permissions || [])}; path=/; max-age=86400; SameSite=Lax`;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', user.role);
      localStorage.setItem('tenant_id', user.tenantId);

      const slug = form.organization.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        + '-' + Math.random().toString(36).substring(2, 6);
      const trialExpiry = new Date();
      trialExpiry.setDate(trialExpiry.getDate() + 14);

      const tenRes = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          name: form.organization, slug, timezone: 'UTC', locale: 'en',
          settings: { adminEmail: form.email, adminName: `${firstName} ${lastName}`, adminPhone: form.phone, companySize: form.size, industry: form.industry, isTrial: true },
        }),
      });
      const tenantId = tenRes.ok ? (await tenRes.json())?.id ?? user.tenantId : user.tenantId;

      await fetch(`/api/tenants/${tenantId}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ days: 14 }),
      }).catch(() => {});

      localStorage.setItem('tenant_id', tenantId);
      localStorage.setItem('trial_expires_at', trialExpiry.toISOString());

      toast.success('Welcome! Your 14-day free trial has started 🎉', { id: tid });
      setTimeout(() => { window.location.href = '/dashboard'; }, 800);
    } catch (err: any) {
      toast.error(err.message || 'Registration failed. Please try again.', { id: tid });
      setLoading(false);
    }
  };

  const FloatingInput = ({ label, type = "text", value, onChange, required = false, id, ...props }: any) => (
    <div className="relative z-0 w-full mb-3 group">
      <input 
        type={type} 
        name={id} 
        id={id} 
        value={value}
        onChange={onChange}
        className="block py-2.5 px-0 w-full text-sm text-zinc-100 bg-transparent border-0 border-b border-zinc-700 appearance-none focus:outline-none focus:ring-0 focus:border-indigo-500 peer transition-colors" 
        placeholder=" " 
        required={required}
        {...props}
      />
      <label 
        htmlFor={id} 
        className="peer-focus:font-medium absolute text-sm text-zinc-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-indigo-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
      >
        {label}
      </label>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-black text-zinc-100 font-sans selection:bg-indigo-500/30">

      {/* ── Left: Form Area ─────────────────────────────────────── */}
      <div className="w-full lg:w-[50%] flex flex-col h-screen overflow-y-auto relative z-10 bg-black custom-scrollbar">
        
        {/* Header / Nav */}
        <div className="p-8 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-md z-20">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
              <span className="font-black text-white text-sm">C</span>
            </div>
            <span className="font-bold text-sm tracking-tight text-zinc-100">CRM Pro</span>
          </Link>
          <div className="text-sm text-zinc-500">
            Already have an account? <Link href="/login" className="text-zinc-100 font-medium hover:text-indigo-400 transition-colors">Sign in</Link>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex flex-col px-8 sm:px-16 md:px-24 max-w-xl mx-auto w-full pb-16">
          
          <div className="mb-6 pt-4">
            <h1 className="text-3xl font-medium tracking-tight mb-1">Create your account</h1>
            <p className="text-zinc-500 text-sm">Start your 14-day free trial. No credit card required.</p>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                 {ssoProviders.github && (
                    <button type="button" className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-medium transition-all">
                      <Github className="w-4 h-4" />
                      <span>GitHub</span>
                    </button>
                 )}
                 {ssoProviders.linkedin && (
                    <button type="button" className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-[#0077b5]/10 border border-[#0077b5]/20 text-[#0077b5] hover:bg-[#0077b5]/20 rounded-xl text-xs font-medium transition-all">
                      <Linkedin className="w-4 h-4" />
                      <span>LinkedIn</span>
                    </button>
                 )}
                 {ssoProviders.google && (
                    <button type="button" className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-medium transition-all">
                      <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                      <span>Google</span>
                    </button>
                 )}
                 {ssoProviders.microsoft && (
                    <button type="button" className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-[#00a4ef]/10 border border-[#00a4ef]/20 text-[#00a4ef] hover:bg-[#00a4ef]/20 rounded-xl text-xs font-medium transition-all">
                      <svg className="w-4 h-4" viewBox="0 0 21 21"><path fill="#f25022" d="M1 1h9v9H1z"/><path fill="#7fba00" d="M11 1h9v9h-9z"/><path fill="#00a4ef" d="M1 11h9v9H1z"/><path fill="#ffb900" d="M11 11h9v9h-9z"/></svg>
                      <span>Microsoft</span>
                    </button>
                 )}
              </div>
              
              <div className="flex items-center space-x-4 pb-1">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Or Register With Email</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Form Details Grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                 <FloatingInput id="name" label="Full Name" value={form.name} onChange={(e: any) => set('name', e.target.value)} required />
                 <FloatingInput id="email" type="email" label="Work Email" value={form.email} onChange={(e: any) => set('email', e.target.value)} required />
                 <FloatingInput id="org" label="Organization Name" value={form.organization} onChange={(e: any) => set('organization', e.target.value)} required />
                 <FloatingInput id="phone" type="tel" label="Phone Number" value={form.phone} onChange={(e: any) => set('phone', e.target.value)} required />
              </div>
                
              <div className="grid grid-cols-2 gap-4">
                  <div className="relative z-0 w-full mb-2 group">
                    <select required value={form.size} onChange={(e) => set('size', e.target.value)} className="block py-2.5 px-0 w-full text-sm text-zinc-100 bg-transparent border-0 border-b border-zinc-700 appearance-none focus:outline-none focus:ring-0 focus:border-indigo-500 peer">
                      <option value="" disabled className="bg-zinc-900 text-zinc-500">Company Size</option>
                      <option value="1-10" className="bg-zinc-900">1–10 employees</option>
                      <option value="11-50" className="bg-zinc-900">11–50 employees</option>
                      <option value="51-200" className="bg-zinc-900">51–200 employees</option>
                      <option value="201+" className="bg-zinc-900">201+ employees</option>
                    </select>
                    <div className="absolute right-0 top-3 pointer-events-none text-zinc-500">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>

                  <div className="relative z-0 w-full mb-2 group">
                    <select required value={form.industry} onChange={(e) => set('industry', e.target.value)} className="block py-2.5 px-0 w-full text-sm text-zinc-100 bg-transparent border-0 border-b border-zinc-700 appearance-none focus:outline-none focus:ring-0 focus:border-indigo-500 peer">
                      <option value="" disabled className="bg-zinc-900 text-zinc-500">Industry</option>
                      <option value="Tech" className="bg-zinc-900">Technology</option>
                      <option value="Finance" className="bg-zinc-900">Finance</option>
                      <option value="Healthcare" className="bg-zinc-900">Healthcare</option>
                      <option value="Retail" className="bg-zinc-900">Retail</option>
                      <option value="Other" className="bg-zinc-900">Other</option>
                    </select>
                    <div className="absolute right-0 top-3 pointer-events-none text-zinc-500">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
              </div>

              {/* Security */}
              <div className="pt-2">
                 <PasswordField
                    id="reg-password"
                    value={form.password}
                    onChange={val => set('password', val)}
                    className="w-full bg-transparent border-0 border-b border-zinc-700 py-2.5 pl-12 pr-12 text-sm text-zinc-100 focus:ring-0 focus:border-indigo-500 transition-colors"
                    showIcon={true}
                    placeholder="Create a secure password"
                  />

                {/* Password Strength Indicator */}
                {form.password.length > 0 && (
                  <div className="mt-3">
                    <div className="flex space-x-1.5">
                      {[1, 2, 3, 4, 5].map(level => (
                        <div key={level} className={cn(
                          "h-1 flex-1 rounded-full transition-all duration-300",
                          passwordStrength >= level ? getStrengthColor() : "bg-white/10"
                        )} />
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-[10px] mt-1.5">
                      <span className={cn("font-medium", form.password.length < 8 ? "text-red-400" : "text-zinc-500")}>
                        Min 8 chars
                      </span>
                      <span className={cn("font-medium uppercase tracking-widest", getStrengthColor().replace('bg-', 'text-'))}>
                        {getStrengthText()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6">
                <button type="submit" disabled={loading} className="w-full py-3.5 bg-white text-black hover:bg-zinc-200 rounded-xl font-medium text-sm transition-all active:scale-95 flex items-center justify-center space-x-2 shadow-[0_0_30px_-5px_rgba(255,255,255,0.2)] disabled:opacity-70 disabled:active:scale-100">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Creating Workspace...</span></> : <span>Start Free Trial</span>}
                </button>

                <p className="text-center text-xs text-zinc-600 pt-4">
                  By creating an account you agree to our <a href="#" className="underline hover:text-zinc-400">Terms of Service</a> and <a href="#" className="underline hover:text-zinc-400">Privacy Policy</a>.
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      {/* ── Right: Illustration / Background Art ─────────────────────────────────────────── */}
      <div className="hidden lg:flex w-[50%] h-screen sticky top-0 overflow-hidden bg-zinc-950 border-l border-white/5 items-center justify-center">
        {/* Dynamic mesh gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-600/20 blur-[120px] mix-blend-screen" />
           <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/15 blur-[120px] mix-blend-screen" />
           <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.04] mix-blend-overlay" />
        </div>

        {/* Feature Showcase */}
        <div className="relative z-10 w-full max-w-lg p-12">
          <div className="mb-12">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-zinc-300 text-[10px] font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
               <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
               Join 10,000+ Teams
             </div>
             <h2 className="text-4xl font-medium leading-[1.1] text-zinc-100 mb-6 tracking-tight">
               Built for modern<br />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-300 to-zinc-600">revenue teams</span>
             </h2>
             <p className="text-zinc-400 text-base leading-relaxed">
               Experience the first fully autonomous CRM that works behind the scenes to help you close deals faster.
             </p>
          </div>

          <div className="space-y-4 relative">
             {/* Connection lines visual */}
             <div className="absolute left-6 top-10 bottom-10 w-px bg-gradient-to-b from-indigo-500/0 via-indigo-500/30 to-indigo-500/0" />
             
             {FEATURES.map((feature, idx) => (
               <motion.div 
                 key={idx}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: idx * 0.1 + 0.5, duration: 0.5 }}
                 className="flex items-start gap-4 group p-4 rounded-2xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5"
               >
                 <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 group-hover:text-indigo-400 transition-all text-zinc-400 shadow-xl relative z-10 bg-zinc-950">
                   <feature.icon className="w-5 h-5" />
                 </div>
                 <div>
                   <h4 className="text-sm font-medium text-zinc-200 mb-1">{feature.title}</h4>
                   <p className="text-sm text-zinc-500">{feature.text}</p>
                 </div>
               </motion.div>
             ))}
          </div>

          {/* Testimonial snippet */}
          <div className="mt-16 p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
             <div className="flex gap-1 mb-3">
               {[1,2,3,4,5].map(i => <svg key={i} className="w-4 h-4 text-amber-500 fill-amber-500" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
             </div>
             <p className="text-zinc-300 text-sm italic leading-relaxed mb-4">"CRM Pro completely transformed our sales process. We've doubled our win rate since we started using their AI agent."</p>
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800" />
                <div>
                   <p className="text-xs font-medium text-zinc-200">Sarah Jenkins</p>
                   <p className="text-[10px] text-zinc-500">VP of Sales, TechFlow</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
