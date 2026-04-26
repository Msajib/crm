'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Zap, 
  Shield, 
  Globe, 
  ChevronRight, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  CheckCircle2,
  Cpu,
  BarChart3,
  Bot
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-xl">C</span>
            </div>
            <span className="font-black text-xl tracking-tight">CRM Pro</span>
          </div>
          <div className="hidden md:flex items-center space-x-10 text-sm font-bold text-muted-foreground uppercase tracking-widest">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
            <a href="#about" className="hover:text-primary transition-colors">About</a>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-sm font-bold text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors">Login</Link>
            <Link href="/login" className="px-6 py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-95">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/40 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/40 rounded-full blur-[120px] animate-pulse"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-10">
             <Sparkles className="w-4 h-4 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-widest text-primary">v2.0 Now with Autonomous AI Agent</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight">
            The CRM that <span className="text-gradient">Thinks</span> and <span className="text-gradient">Acts</span>.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 font-medium leading-relaxed">
            Move beyond data entry. Our autonomous AI Agent identifies leads, scores deals, and automates follow-ups while you focus on closing.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/login" className="w-full sm:w-auto px-10 py-5 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/30 hover:opacity-90 transition-all active:scale-95 flex items-center justify-center space-x-3">
               <span>Deploy Now</span>
               <ChevronRight className="w-5 h-5" />
            </Link>
            <Link href="#features" className="w-full sm:w-auto px-10 py-5 bg-muted border border-border text-foreground rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-accent transition-all flex items-center justify-center">
               Watch Demo
            </Link>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-24 glass-premium rounded-[48px] border border-border p-4 relative group">
             <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-[50px] blur opacity-10 group-hover:opacity-20 transition-opacity"></div>
             <div className="relative bg-background rounded-[40px] overflow-hidden border border-border aspect-[16/9] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-muted/50 to-background"></div>
                <div className="relative z-10 text-center space-y-4">
                   <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <BarChart3 className="w-10 h-10 text-primary" />
                   </div>
                   <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Interactive Dashboard Preview</p>
                   <h3 className="text-2xl font-black">AI-Powered Sales Analytics</h3>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-muted/30 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
             <h2 className="text-xs font-black text-primary uppercase tracking-[0.4em] mb-4">Enterprise Features</h2>
             <h3 className="text-4xl md:text-5xl font-black">Everything you need to <span className="text-gradient">scale</span>.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Bot />} 
              title="Autonomous AI Agent" 
              desc="The AI Sales Agent doesn't just score leads; it analyzes deal health and recommends winning strategies in real-time."
            />
            <FeatureCard 
              icon={<Zap />} 
              title="Visual Automations" 
              desc="Build complex multi-step follow-up workflows with our visual wizard. No coding required, just pure logic."
            />
            <FeatureCard 
              icon={<Globe />} 
              title="Multi-channel Hub" 
              desc="Integrated Email, SMS, and WhatsApp communication with unified threading and history for every contact."
            />
            <FeatureCard 
              icon={<Shield />} 
              title="Bank-Grade Security" 
              desc="RLS-protected data silos for every tenant, with automated daily backups and full audit logging for compliance."
            />
            <FeatureCard 
              icon={<Cpu />} 
              title="MCP Interoperability" 
              desc="Expose your CRM data to external AI models through the Model Context Protocol for cross-platform intelligence."
            />
            <FeatureCard 
              icon={<Users />} 
              title="Advanced RBAC" 
              desc="Four tiers of access control ensuring team members only see the data they need to perform their roles."
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-16 items-center">
             <div className="w-full md:w-1/2 space-y-8">
                <h2 className="text-xs font-black text-primary uppercase tracking-[0.4em]">Our Mission</h2>
                <h3 className="text-4xl md:text-5xl font-black leading-tight">We're building the future of <span className="text-gradient">sales intelligence</span>.</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                   Founded in 2026, CRM Pro was built by a team of elite engineers and sales veterans who were tired of bloated, slow, and dumb CRM systems. We believe that your CRM should work for you, not the other way around. By integrating cutting-edge AI and seamless workflows, we're giving modern teams the tools they need to close deals faster than ever before.
                </p>
                <div className="flex items-center space-x-6 pt-4">
                   <div className="flex flex-col">
                      <span className="text-3xl font-black">10M+</span>
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Leads Scored</span>
                   </div>
                   <div className="w-px h-12 bg-border"></div>
                   <div className="flex flex-col">
                      <span className="text-3xl font-black">99.9%</span>
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Uptime</span>
                   </div>
                   <div className="w-px h-12 bg-border"></div>
                   <div className="flex flex-col">
                      <span className="text-3xl font-black">24/7</span>
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Support</span>
                   </div>
                </div>
             </div>
             <div className="w-full md:w-1/2 relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary to-purple-600 rounded-[60px] blur-[80px] opacity-20"></div>
                <div className="glass-premium rounded-[60px] border border-border p-2 relative overflow-hidden">
                   <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80" alt="Team Collaboration" className="rounded-[50px] w-full h-[500px] object-cover" />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
             <h2 className="text-4xl md:text-5xl font-black mb-6">Simple, Scalable <span className="text-gradient">Pricing</span>.</h2>
             <p className="text-muted-foreground font-medium">Choose the plan that fits your growth trajectory.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <PricingCard tier="Starter" price="$49" features={['10 Users', 'Basic AI Scoring', 'Email Integration', 'Standard Analytics']} />
             <PricingCard tier="Professional" price="$149" popular features={['Unlimited Users', 'Autonomous AI Agent', 'Full Automation Wizard', 'Advanced Analytics', 'Webhook System']} />
             <PricingCard tier="Enterprise" price="Custom" features={['Multi-tenant Deployment', 'MCP Protocol Server', 'White-label Options', '24/7 Priority Support', 'Custom Integrations']} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32">
         <div className="max-w-7xl mx-auto px-6">
            <div className="glass-premium rounded-[60px] border border-border p-12 md:p-24 text-center relative overflow-hidden bg-primary/5">
               <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px]"></div>
               <div className="relative z-10">
                  <h2 className="text-4xl md:text-6xl font-black mb-10 leading-tight">Ready to transform your <span className="text-gradient">sales engine</span>?</h2>
                  <Link href="/login" className="inline-flex items-center space-x-4 px-12 py-6 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/30 hover:opacity-90 transition-all active:scale-95">
                     <span>Start Your 14-Day Trial</span>
                     <ChevronRight className="w-5 h-5" />
                  </Link>
                  <p className="text-muted-foreground mt-8 font-medium text-xs uppercase tracking-widest italic">No credit card required • Instant setup</p>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-border">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
               <div className="flex items-center space-x-3 mb-8">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                    <span className="text-white font-black text-xl">C</span>
                  </div>
                  <span className="font-black text-xl tracking-tight">CRM Pro</span>
               </div>
               <p className="text-muted-foreground max-w-sm font-medium leading-relaxed">
                  The world's first autonomous CRM designed for modern sales teams who demand speed, intelligence, and beautiful design.
               </p>
            </div>
            <div>
               <h4 className="font-black text-xs uppercase tracking-widest mb-8">Product</h4>
               <ul className="space-y-4 text-sm font-bold text-muted-foreground">
                  <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">AI Sales Agent</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Integrations</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
               </ul>
            </div>
            <div>
               <h4 className="font-black text-xs uppercase tracking-widest mb-8">Company</h4>
               <ul className="space-y-4 text-sm font-bold text-muted-foreground">
                  <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Legal</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Status</a></li>
               </ul>
            </div>
         </div>
         <div className="max-w-7xl mx-auto px-6 mt-20 pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">&copy; 2026 CRM Pro SaaS Platform. Built with Antigravity.</p>
            <div className="flex items-center space-x-6 text-muted-foreground">
               <Globe className="w-5 h-5 hover:text-primary cursor-pointer transition-colors" />
               <MessageSquare className="w-5 h-5 hover:text-primary cursor-pointer transition-colors" />
               <TrendingUp className="w-5 h-5 hover:text-primary cursor-pointer transition-colors" />
            </div>
         </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="glass-premium p-8 rounded-[40px] border border-border group hover:border-primary/30 transition-all premium-shadow">
      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform text-primary">
        {React.cloneElement(icon, { className: 'w-7 h-7' })}
      </div>
      <h4 className="text-xl font-black mb-4">{title}</h4>
      <p className="text-sm text-muted-foreground font-medium leading-relaxed">{desc}</p>
    </div>
  );
}

function PricingCard({ tier, price, features, popular }: any) {
  return (
    <div className={`p-10 rounded-[48px] border flex flex-col ${popular ? 'bg-primary text-white border-transparent scale-105 shadow-3xl shadow-primary/30' : 'bg-background border-border text-foreground'}`}>
       {popular && <span className="bg-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full self-start mb-8">Most Popular</span>}
       <h4 className={`text-xl font-black mb-2 ${popular ? 'text-white' : 'text-foreground'}`}>{tier}</h4>
       <div className="flex items-baseline space-x-1 mb-10">
          <span className="text-4xl font-black">{price}</span>
          {price !== 'Custom' && <span className={`text-xs font-bold ${popular ? 'text-white/70' : 'text-muted-foreground'}`}>/month</span>}
       </div>
       <ul className="space-y-4 mb-12 flex-1">
          {features.map((f: string) => (
             <li key={f} className="flex items-center space-x-3 text-sm font-bold opacity-90">
                <CheckCircle2 className={`w-5 h-5 ${popular ? 'text-white' : 'text-primary'}`} />
                <span>{f}</span>
             </li>
          ))}
       </ul>
       <button className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 ${popular ? 'bg-white text-primary hover:bg-white/90' : 'bg-primary text-white hover:opacity-90 shadow-xl shadow-primary/20'}`}>
          Get Started
       </button>
    </div>
  );
}
