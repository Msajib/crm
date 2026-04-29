'use client';

import React, { useState, useEffect } from 'react';
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
  Bot,
  X,
  CreditCard,
  Lock,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const DEFAULT_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$49',
    period: '/month',
    badge: '',
    description: '<p>Perfect for small teams getting started with CRM.</p>',
    features: ['10 Users', 'Basic AI Scoring', 'Email Integration', 'Standard Analytics'],
    highlighted: false,
    cta: 'Get Started',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$149',
    period: '/month',
    badge: 'Most Popular',
    description: '<p>The full power of AI-driven sales automation for growing teams.</p>',
    features: ['Unlimited Users', 'Autonomous AI Agent', 'Full Automation Wizard', 'Advanced Analytics', 'Webhook System'],
    highlighted: true,
    cta: 'Start Free Trial',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    badge: '',
    description: '<p>Tailored for large organizations with complex requirements and dedicated support.</p>',
    features: ['Multi-tenant Deployment', 'MCP Protocol Server', 'White-label Options', '24/7 Priority Support', 'Custom Integrations'],
    highlighted: false,
    cta: 'Contact Sales',
  },
];

// --- Animations ---
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const floatAnimation = {
  y: [-10, 10, -10],
  transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
};

export default function LandingPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);

  // Load plans from localStorage to reflect admin changes instantly
  useEffect(() => {
    const loadPlans = () => {
      const savedPlans = localStorage.getItem('crm_pricing_plans');
      if (savedPlans) {
        try {
          setPlans(JSON.parse(savedPlans));
        } catch {
          setPlans(DEFAULT_PLANS);
        }
      } else {
        setPlans(DEFAULT_PLANS);
      }
    };
    
    loadPlans();
    
    // Listen for custom event triggered by admin settings
    window.addEventListener('pricing-updated', loadPlans);
    return () => window.removeEventListener('pricing-updated', loadPlans);
  }, []);

  const handleSubscribe = (plan: any) => {
    if (plan.price === 'Custom') {
      window.location.href = '/contact-sales';
      return;
    }
    setSelectedPlan(plan);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3">
              <img src="/logo.png" alt="CRM Pro Logo" className="w-10 h-10 object-contain" />
              <span className="font-black text-xl tracking-tight">CRM Pro</span>
            </Link>
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
          <motion.div animate={floatAnimation} className="absolute top-0 right-0 w-96 h-96 bg-primary/40 rounded-full blur-[120px]" />
          <motion.div animate={{ ...floatAnimation, y: [10, -10, 10] }} className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/40 rounded-full blur-[120px]" />
        </div>

        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={staggerContainer} 
          className="max-w-7xl mx-auto px-6 relative z-10 text-center"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-10">
             <Sparkles className="w-4 h-4 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-widest text-primary">v2.0 Now with Autonomous AI Agent</span>
          </motion.div>
          <motion.h1 variants={fadeInUp} className="text-5xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight">
            The CRM that <span className="text-gradient">Thinks</span> and <span className="text-gradient">Acts</span>.
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 font-medium leading-relaxed">
            Move beyond data entry. Our autonomous AI Agent identifies leads, scores deals, and automates follow-ups while you focus on closing.
          </motion.p>
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/login" className="w-full sm:w-auto px-10 py-5 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/30 hover:opacity-90 transition-all active:scale-95 flex items-center justify-center space-x-3">
               <span>Deploy Now</span>
               <ChevronRight className="w-5 h-5" />
            </Link>
            <Link href="#features" className="w-full sm:w-auto px-10 py-5 bg-muted border border-border text-foreground rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-accent transition-all flex items-center justify-center">
               Watch Demo
            </Link>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div variants={fadeInUp} className="mt-24 glass-premium rounded-[48px] border border-border p-4 relative group">
             <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-[50px] blur opacity-10 group-hover:opacity-20 transition-opacity"></div>
             <div className="relative bg-background rounded-[40px] overflow-hidden border border-border aspect-[16/9] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-muted/50 to-background"></div>
                <div className="relative z-10 text-center space-y-4">
                   <motion.div animate={floatAnimation} className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <BarChart3 className="w-10 h-10 text-primary" />
                   </motion.div>
                   <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Interactive Dashboard Preview</p>
                   <h3 className="text-2xl font-black">AI-Powered Sales Analytics</h3>
                </div>
             </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-muted/30 relative">
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-100px" }} 
          variants={staggerContainer} 
          className="max-w-7xl mx-auto px-6"
        >
          <motion.div variants={fadeInUp} className="text-center mb-24">
             <h2 className="text-xs font-black text-primary uppercase tracking-[0.4em] mb-4">Enterprise Features</h2>
             <h3 className="text-4xl md:text-5xl font-black">Everything you need to <span className="text-gradient">scale</span>.</h3>
          </motion.div>

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
        </motion.div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32">
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-100px" }} 
          variants={staggerContainer} 
          className="max-w-7xl mx-auto px-6"
        >
          <motion.div variants={fadeInUp} className="text-center mb-20">
             <h2 className="text-display mb-6">Simple, Scalable <span className="text-gradient">Pricing</span>.</h2>
             <p className="text-body text-muted-foreground">Choose the plan that fits your growth trajectory.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {plans.length > 0 ? (
               plans.map(plan => (
                 <PricingCard 
                   key={plan.id}
                   tier={plan.name} 
                   price={plan.price} 
                   period={plan.period}
                   popular={plan.highlighted}
                   description={plan.description}
                   features={plan.features} 
                   cta={plan.cta}
                   onSubscribe={() => handleSubscribe(plan)}
                 />
               ))
             ) : (
               <div className="col-span-3 text-center py-20">
                 <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                 <p className="text-muted-foreground font-bold">Loading plans...</p>
               </div>
             )}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-32">
         <motion.div 
           initial="hidden" 
           whileInView="visible" 
           viewport={{ once: true }} 
           variants={fadeInUp} 
           className="max-w-7xl mx-auto px-6"
         >
            <div className="glass-premium rounded-[60px] border border-border p-12 md:p-24 text-center relative overflow-hidden bg-primary/5">
               <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 5, repeat: Infinity }} className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px]"></motion.div>
               <div className="relative z-10">
                  <h2 className="text-display md:text-6xl mb-10 leading-tight">Ready to transform your <span className="text-gradient">sales engine</span>?</h2>
                  <Link href="/login" className="inline-flex items-center space-x-4 px-12 py-6 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/30 hover:opacity-90 transition-all active:scale-95">
                     <span>Start Your 14-Day Trial</span>
                     <ChevronRight className="w-5 h-5" />
                  </Link>
                  <p className="text-micro text-muted-foreground mt-8 italic">No credit card required • Instant setup</p>
               </div>
            </div>
         </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-border">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
               <div className="flex items-center space-x-3 mb-8">
                  <img src="/logo.png" alt="CRM Pro Logo" className="w-10 h-10 object-contain" />
                  <span className="text-heading text-foreground">CRM Pro</span>
               </div>
               <p className="text-body text-muted-foreground max-w-sm">
                  The world's first autonomous CRM designed for modern sales teams who demand speed, intelligence, and beautiful design.
               </p>
            </div>
            <div>
               <h4 className="text-micro text-foreground mb-8">Product</h4>
               <ul className="space-y-4 text-sm font-bold text-muted-foreground">
                  <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">AI Sales Agent</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Integrations</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
               </ul>
            </div>
            <div>
               <h4 className="text-micro text-foreground mb-8">Company</h4>
               <ul className="space-y-4 text-sm font-bold text-muted-foreground">
                  <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Legal</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Status</a></li>
               </ul>
            </div>
         </div>
      </footer>

      {/* Checkout Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <CheckoutModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <motion.div variants={fadeInUp} className="glass-premium p-8 rounded-[40px] border border-border group hover:border-primary/30 transition-all premium-shadow">
      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform text-primary">
        {React.cloneElement(icon, { className: 'w-7 h-7' })}
      </div>
      <h4 className="text-subheading text-foreground mb-4">{title}</h4>
      <p className="text-body text-muted-foreground">{desc}</p>
    </motion.div>
  );
}

function PricingCard({ tier, price, period, features, popular, description, cta, onSubscribe }: any) {
  return (
    <motion.div variants={fadeInUp} className={`p-10 rounded-[48px] border flex flex-col transition-all ${popular ? 'bg-primary text-white border-transparent scale-105 shadow-3xl shadow-primary/30' : 'bg-card border-border text-foreground hover:border-primary/30'}`}>
       {popular && <span className="bg-white/20 text-white text-micro px-4 py-1.5 rounded-full self-start mb-8">Most Popular</span>}
       <h4 className={`text-subheading mb-2 ${popular ? 'text-white' : 'text-foreground'}`}>{tier}</h4>
       <div className="flex items-baseline space-x-1 mb-6">
          <span className="text-4xl font-black tabular-nums">{price}</span>
          {price !== 'Custom' && <span className={`text-caption ${popular ? 'text-white/70' : 'text-muted-foreground'}`}>{period || '/month'}</span>}
       </div>
       {description && (
         <div 
           className={`text-body mb-8 opacity-80 rte-content-display ${popular ? 'text-white' : 'text-muted-foreground'}`}
           dangerouslySetInnerHTML={{ __html: description }}
         />
       )}
       <ul className="space-y-4 mb-12 flex-1">
          {features?.map((f: string, idx: number) => (
             <li key={idx} className="flex items-center space-x-3 text-body font-bold opacity-90">
                <CheckCircle2 className={`w-5 h-5 ${popular ? 'text-white' : 'text-primary'}`} />
                <span>{f}</span>
             </li>
          ))}
       </ul>
       <button 
         onClick={onSubscribe}
         className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 ${popular ? 'bg-white text-primary hover:bg-white/90' : 'bg-primary text-white hover:opacity-90 shadow-xl shadow-primary/20'}`}
       >
          {cta || 'Get Started'}
       </button>
    </motion.div>
  );
}

function CheckoutModal({ plan, onClose }: any) {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', card: '', expiry: '', cvc: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.card || !formData.expiry || !formData.cvc) {
      toast.error('Please fill in all payment details.', { position: 'top-center' });
      return;
    }
    
    if (formData.card.replace(/\s/g, '').length < 15) {
      toast.error('Invalid card number. Please check again.', { position: 'top-center' });
      return;
    }

    setIsProcessing(true);
    
    // Simulate pending payment history entry
    const newPayment = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      plan: plan.name,
      amount: plan.price,
      status: 'PENDING',
      date: new Date().toISOString()
    };
    
    const existingPayments = JSON.parse(localStorage.getItem('mock_payment_history') || '[]');
    localStorage.setItem('mock_payment_history', JSON.stringify([...existingPayments, newPayment]));
    
    // Simulate API call & payment processing
    setTimeout(() => {
      // Update payment status to success
      const updatedPayments = JSON.parse(localStorage.getItem('mock_payment_history') || '[]');
      const paymentIndex = updatedPayments.findIndex((p: any) => p.id === newPayment.id);
      if (paymentIndex > -1) {
        updatedPayments[paymentIndex].status = 'SUCCESS';
        localStorage.setItem('mock_payment_history', JSON.stringify(updatedPayments));
      }
      
      // Create Tenant
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const newTenant = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name + ' Workspace',
        slug: slug,
        email: formData.email,
        plan: plan.name.toUpperCase(),
        status: 'ACTIVE',
        joined: new Date().toISOString().split('T')[0]
      };
      const existingTenants = JSON.parse(localStorage.getItem('mock_tenants_db') || '[]');
      localStorage.setItem('mock_tenants_db', JSON.stringify([...existingTenants, newTenant]));

      // Create Admin User
      // Create Admin User with generated password
      const generatedPassword = Math.random().toString(36).slice(-8);
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: 'ADMIN',
        tenant_slug: slug,
        isActive: true,
        joined: new Date().toISOString().split('T')[0]
      };
      const existingUsers = JSON.parse(localStorage.getItem('mock_users_db') || '[]');
      localStorage.setItem('mock_users_db', JSON.stringify([...existingUsers, newUser]));

      // Set Login Session and forced password reset flag
      localStorage.setItem('token', 'mock_token_' + newUser.id);
      localStorage.setItem('role', 'ADMIN');
      localStorage.setItem('tenant_slug', slug);
      localStorage.setItem('user_email', formData.email);
      localStorage.setItem('mustChangePassword', 'true');
      
      // Set cookie so middleware allows access to dashboard
      document.cookie = `token=mock_token_${newUser.id}; path=/; max-age=86400`;

      setIsProcessing(false);
      setIsSuccess(true);
      
      // Simulate Email Delivery
      toast.success('Payment successful! Welcome aboard.', { position: 'top-center', icon: '🎉' });
      setTimeout(() => {
        toast.success(`Email sent! Your temporary password is: ${generatedPassword}`, { 
          position: 'top-center', 
          icon: '📧',
          duration: 10000 
        });
      }, 500);
      
      // Close after showing success and redirect to profile
      setTimeout(() => {
        onClose();
        window.location.href = '/dashboard/settings/profile';
      }, 3500);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-md" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-card border border-border rounded-[40px] shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6"
            >
              <CheckCircle2 className="w-12 h-12" />
            </motion.div>
            <h2 className="text-3xl font-black mb-3">Subscription Active!</h2>
            <p className="text-muted-foreground font-medium">Redirecting to your dashboard...</p>
          </div>
        ) : (
          <div className="p-8 md:p-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="mb-8">
              <h2 className="text-2xl font-black mb-2">Complete Subscription</h2>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{plan.name} Plan • {plan.price}{plan.period || '/month'}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-muted border border-border rounded-2xl px-5 py-4 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/30"
                  placeholder="John Doe"
                  disabled={isProcessing}
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-muted border border-border rounded-2xl px-5 py-4 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/30"
                    placeholder="john@company.com"
                    disabled={isProcessing}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Phone</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-muted border border-border rounded-2xl px-5 py-4 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/30"
                    placeholder="+1 (555) 000-0000"
                    disabled={isProcessing}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Card Details</label>
                <div className="relative">
                  <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input 
                    type="text" 
                    value={formData.card}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').substring(0, 16);
                      const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                      setFormData({...formData, card: formatted});
                    }}
                    className="w-full bg-muted border border-border rounded-2xl pl-12 pr-5 py-4 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/30"
                    placeholder="0000 0000 0000 0000"
                    disabled={isProcessing}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Expiry</label>
                  <input 
                    type="text" 
                    value={formData.expiry}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').substring(0, 4);
                      const formatted = val.length > 2 ? `${val.substring(0,2)}/${val.substring(2)}` : val;
                      setFormData({...formData, expiry: formatted});
                    }}
                    className="w-full bg-muted border border-border rounded-2xl px-5 py-4 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/30"
                    placeholder="MM/YY"
                    disabled={isProcessing}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">CVC</label>
                  <input 
                    type="text" 
                    value={formData.cvc}
                    onChange={(e) => setFormData({...formData, cvc: e.target.value.replace(/\D/g, '').substring(0, 4)})}
                    className="w-full bg-muted border border-border rounded-2xl px-5 py-4 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/30"
                    placeholder="123"
                    disabled={isProcessing}
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-center space-x-2 text-muted-foreground">
                <Lock className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Payments are secure and encrypted</span>
              </div>

              <button 
                type="submit"
                disabled={isProcessing}
                className="w-full mt-4 py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:active:scale-100"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <span>Pay {plan.price}</span>
                )}
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}
