'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, Zap, Shield, Globe, ChevronRight, Users, 
  Cpu, BarChart3, Bot, X, CreditCard, Lock, Loader2,
  CheckCircle2, ArrowRight, PlayCircle, Workflow, 
  Layers, LockKeyhole, Search, Star, MessageSquare,
  Sun, Moon
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import * as AccordionPrimitive from '@radix-ui/react-accordion';

const DEFAULT_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$49',
    period: '/mo',
    badge: '',
    description: 'Perfect for small teams getting started with CRM.',
    features: ['10 Team Members', 'Basic AI Lead Scoring', 'Email Integration', 'Standard Analytics'],
    highlighted: false,
    cta: 'Get Started',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$149',
    period: '/mo',
    badge: 'Most Popular',
    description: 'Full power of AI-driven sales automation for growing teams.',
    features: ['Unlimited Members', 'Autonomous AI Agent', 'Full Automation Wizard', 'Advanced Analytics', 'Webhook System'],
    highlighted: true,
    cta: 'Start Free Trial',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    badge: '',
    description: 'Tailored for large organizations with complex requirements.',
    features: ['Multi-tenant Deployment', 'MCP Protocol Server', 'White-label Options', '24/7 Priority Support', 'Custom Integrations'],
    highlighted: false,
    cta: 'Contact Sales',
  },
];

const FAQS = [
  {
    question: "How does the AI Agent work?",
    answer: "Our Autonomous AI Agent connects to your email, WhatsApp, and SMS streams to identify lead intent, automatically score them, and even draft context-aware replies. It works in the background 24/7."
  },
  {
    question: "Do you offer a free trial?",
    answer: "Yes, our Professional plan comes with a 14-day fully-featured free trial. No credit card is required to start."
  },
  {
    question: "Can I integrate with my existing tools?",
    answer: "Absolutely. We offer a robust Webhook system and native integrations with popular tools like Slack, Google Workspace, and Zapier."
  },
  {
    question: "Is my data secure?",
    answer: "Security is our top priority. We use bank-grade encryption, role-based access control (RBAC), and strict row-level security to ensure your data is isolated and protected."
  }
];

// --- Animations ---
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

// -- Radix Accordion Components --
const AccordionItem = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Item>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn("border-b border-border", className)} {...props} />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger ref={ref} className={cn("flex flex-1 items-center justify-between py-5 text-sm md:text-base font-medium transition-all hover:text-primary [&[data-state=open]>svg]:rotate-180", className)} {...props}>
      {children}
      <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200 text-muted-foreground" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Content>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content ref={ref} className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down" {...props}>
    <div className={cn("pb-5 pt-0 text-muted-foreground leading-relaxed", className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export default function LandingPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const loadPlans = () => {
      const savedPlans = localStorage.getItem('crm_pricing_plans');
      if (savedPlans) {
        try { setPlans(JSON.parse(savedPlans)); } catch { setPlans(DEFAULT_PLANS); }
      } else {
        setPlans(DEFAULT_PLANS);
      }
    };
    loadPlans();
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
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 overflow-x-hidden font-sans">
      
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div style={{ y }} className="absolute -top-[40%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/10 blur-[120px] mix-blend-screen" />
        <motion.div style={{ y: useTransform(scrollYProgress, [0, 1], [0, -300]) }} className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[120px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] dark:opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300">
              <span className="font-black text-white text-sm">C</span>
            </div>
            <span className="font-bold text-sm tracking-tight text-foreground">CRM Pro</span>
          </Link>
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </div>
          <div className="flex items-center space-x-4">
            {mounted && (
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
            <Link href="/login" className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Sign in</Link>
            <Link href="/register" className="px-4 py-2 bg-foreground text-background hover:opacity-90 rounded-full text-sm font-medium transition-all active:scale-95">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32">
        {/* Hero Section */}
        <section className="relative px-6 pb-32 lg:pb-40 text-center max-w-7xl mx-auto flex flex-col items-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-center max-w-4xl">
            
            <motion.div variants={fadeInUp} className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-8 backdrop-blur-sm">
               <Sparkles className="w-3.5 h-3.5 text-primary" />
               <span className="text-[11px] font-medium text-primary">CRM Pro v2.0 is now live</span>
               <div className="w-px h-3 bg-primary/20 mx-2" />
               <Link href="/register" className="text-[11px] font-semibold text-primary hover:opacity-80 flex items-center">
                 Read announcement <ArrowRight className="w-3 h-3 ml-1" />
               </Link>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl lg:text-8xl font-medium mb-6 leading-[1.05] tracking-tight text-balance text-foreground">
              The CRM that <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">works for you.</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 font-normal leading-relaxed text-balance">
              Move beyond data entry. Our autonomous AI Agent identifies leads, scores deals, and automates follow-ups while you focus on closing.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link href="/register" className="w-full sm:w-auto px-6 py-3.5 bg-foreground text-background hover:opacity-90 rounded-full font-medium text-sm transition-all active:scale-95 flex items-center justify-center space-x-2 shadow-2xl">
                 <span>Start 14-day free trial</span>
                 <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="w-full sm:w-auto px-6 py-3.5 bg-background border border-border text-foreground rounded-full font-medium text-sm hover:bg-muted transition-all flex items-center justify-center space-x-2 backdrop-blur-sm">
                 <PlayCircle className="w-4 h-4 text-muted-foreground" />
                 <span>Watch Demo</span>
              </button>
            </motion.div>
          </motion.div>

          {/* Hero Image/Dashboard Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 60 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }} 
            className="mt-20 w-full relative max-w-5xl mx-auto perspective-[2000px]"
          >
             <div className="absolute -inset-1 bg-gradient-to-b from-primary/20 to-transparent rounded-[2rem] blur-xl opacity-50"></div>
             <div className="relative rounded-2xl md:rounded-[2rem] bg-card border border-border shadow-2xl overflow-hidden aspect-[16/10] md:aspect-[16/9] flex flex-col transform-gpu rotate-x-[2deg] hover:rotate-x-0 transition-transform duration-700 ease-out">
                {/* Mock Header */}
                <div className="h-12 border-b border-border bg-muted/30 flex items-center px-4 space-x-2 backdrop-blur-md">
                   <div className="flex space-x-1.5">
                     <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                     <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                     <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                   </div>
                </div>
                {/* Mock Content */}
                <div className="flex-1 p-6 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,rgba(var(--primary),0.05),transparent_50%)]">
                   <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 shadow-xl shadow-primary/10">
                      <BarChart3 className="w-8 h-8 text-primary" />
                   </motion.div>
                   <h3 className="text-xl font-medium text-foreground">AI-Powered Sales Analytics</h3>
                   <p className="text-sm text-muted-foreground mt-2">Interactive Dashboard Preview</p>
                </div>
             </div>
          </motion.div>
        </section>

        {/* Logos/Social Proof */}
        <section className="py-12 border-y border-border bg-muted/10">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-sm font-medium text-muted-foreground mb-8">Trusted by innovative teams worldwide</p>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 text-foreground">
               {['Acme Corp', 'GlobalNet', 'TechFlow', 'Stark Industries', 'Wayne Ent'].map(logo => (
                 <div key={logo} className="text-xl font-bold tracking-tighter">{logo}</div>
               ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-32 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-20 max-w-3xl">
               <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-6">
                 Everything you need to scale your revenue.
               </h2>
               <p className="text-muted-foreground text-lg">
                 A comprehensive suite of tools designed to automate busywork and surface actionable insights.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard 
                icon={<Bot />} 
                title="Autonomous AI Agent" 
                desc="The AI Sales Agent analyzes deal health and recommends winning strategies in real-time."
              />
              <FeatureCard 
                icon={<Workflow />} 
                title="Visual Automations" 
                desc="Build complex multi-step follow-up workflows with our visual wizard. No coding required."
              />
              <FeatureCard 
                icon={<MessageSquare />} 
                title="Multi-channel Hub" 
                desc="Integrated Email, SMS, and WhatsApp communication with unified threading."
              />
              <FeatureCard 
                icon={<LockKeyhole />} 
                title="Bank-Grade Security" 
                desc="RLS-protected data silos for every tenant, with automated daily backups."
              />
              <FeatureCard 
                icon={<Layers />} 
                title="MCP Interoperability" 
                desc="Expose your CRM data to external AI models through the Model Context Protocol."
              />
              <FeatureCard 
                icon={<Users />} 
                title="Advanced RBAC" 
                desc="Four tiers of access control ensuring team members only see what they need."
              />
            </div>
          </div>
        </section>

        {/* How It Works (Timeline) */}
        <section id="how-it-works" className="py-32 border-t border-border bg-muted/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20 max-w-3xl mx-auto">
               <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-4">How CRM Pro works</h2>
               <p className="text-muted-foreground text-lg">A simple workflow designed for maximum efficiency.</p>
            </div>

            <div className="space-y-12 max-w-4xl mx-auto relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">1</span>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-card border border-border shadow-sm hover:border-primary/30 transition-colors">
                  <h3 className="text-lg font-medium text-foreground mb-2">Connect Your Data</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">Import contacts via CSV or connect directly to your email, website forms, and existing tools using our seamless integrations.</p>
                </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">2</span>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-card border border-border shadow-sm hover:border-primary/30 transition-colors">
                  <h3 className="text-lg font-medium text-foreground mb-2">AI Analyzes & Scores</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">Our AI immediately begins enriching contact profiles and assigning lead scores based on engagement, demographics, and firmographics.</p>
                </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">3</span>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-card border border-border shadow-sm hover:border-primary/30 transition-colors">
                  <h3 className="text-lg font-medium text-foreground mb-2">Automate Engagement</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">Set up triggers to automatically send emails or SMS to high-intent leads, instantly alerting your sales team when intervention is needed.</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-32 border-t border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20 max-w-3xl mx-auto">
               <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-4">Simple, transparent pricing.</h2>
               <p className="text-muted-foreground text-lg">No hidden fees. Cancel anytime.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                   <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-4" />
                   <p className="text-muted-foreground font-medium">Loading plans...</p>
                 </div>
               )}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-32 border-t border-border bg-muted/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 max-w-3xl mx-auto">
               <h2 className="text-3xl font-medium tracking-tight mb-4">Frequently Asked Questions</h2>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <AccordionPrimitive.Root type="single" collapsible className="w-full">
                {FAQS.map((faq, i) => (
                  <AccordionItem value={`item-${i}`} key={i}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </AccordionPrimitive.Root>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 border-t border-border relative overflow-hidden">
           <div className="absolute inset-0 bg-primary/5 mix-blend-screen"></div>
           <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
              <h2 className="text-4xl md:text-6xl font-medium mb-6 tracking-tight">Ready to transform your sales engine?</h2>
              <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">Join thousands of forward-thinking teams using CRM Pro to automate workflows and close deals faster.</p>
              <Link href="/register" className="inline-flex items-center space-x-2 px-8 py-4 bg-foreground text-background hover:opacity-90 rounded-full font-medium text-sm transition-all active:scale-95 shadow-2xl">
                 <span>Start Your Free Trial</span>
                 <ArrowRight className="w-4 h-4" />
              </Link>
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-background relative z-10">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
            <div className="col-span-2 lg:col-span-2">
               <Link href="/" className="flex items-center space-x-2 mb-6">
                  <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                    <span className="font-black text-white text-[10px]">C</span>
                  </div>
                  <span className="font-bold text-sm tracking-tight text-foreground">CRM Pro</span>
               </Link>
               <p className="text-sm text-muted-foreground max-w-xs mb-6">
                  The world's first autonomous CRM designed for modern sales teams who demand speed, intelligence, and beautiful design.
               </p>
               <div className="flex space-x-4 text-muted-foreground">
                  <a href="#" className="hover:text-foreground transition-colors"><span className="sr-only">Twitter</span><svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
                  <a href="#" className="hover:text-foreground transition-colors"><span className="sr-only">GitHub</span><svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg></a>
               </div>
            </div>
            <div>
               <h4 className="text-sm font-semibold text-foreground mb-4">Product</h4>
               <ul className="space-y-3 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Integrations</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Changelog</a></li>
               </ul>
            </div>
            <div>
               <h4 className="text-sm font-semibold text-foreground mb-4">Company</h4>
               <ul className="space-y-3 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
               </ul>
            </div>
            <div>
               <h4 className="text-sm font-semibold text-foreground mb-4">Legal</h4>
               <ul className="space-y-3 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
               </ul>
            </div>
         </div>
         <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} CRM Pro. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
               <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div> All systems operational</span>
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
    <motion.div variants={fadeInUp} className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:border-primary/30 transition-all duration-300 group">
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300 text-muted-foreground group-hover:text-primary">
        {React.cloneElement(icon, { className: 'w-6 h-6' })}
      </div>
      <h4 className="text-lg font-medium text-foreground mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function PricingCard({ tier, price, period, features, popular, description, cta, onSubscribe }: any) {
  return (
    <motion.div variants={fadeInUp} className={cn(
      "relative p-8 rounded-[2rem] border flex flex-col transition-all duration-300",
      popular ? "bg-card border-primary/50 shadow-xl shadow-primary/10" : "bg-card border-border hover:border-border/80"
    )}>
       {popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-primary to-purple-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">Most Popular</div>}
       
       <div className="mb-6">
         <h4 className="text-lg font-medium text-foreground mb-2">{tier}</h4>
         <p className="text-sm text-muted-foreground h-10">{description}</p>
       </div>

       <div className="flex items-baseline space-x-1 mb-8">
          <span className="text-5xl font-medium tracking-tight text-foreground">{price}</span>
          {price !== 'Custom' && <span className="text-sm text-muted-foreground font-medium">{period}</span>}
       </div>
       
       <button 
         onClick={onSubscribe}
         className={cn(
           "w-full py-3 rounded-full font-medium text-sm transition-all active:scale-95 mb-8",
           popular ? "bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20" : "bg-muted text-foreground hover:bg-muted/80"
         )}
       >
          {cta || 'Get Started'}
       </button>

       <div className="space-y-4 flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Includes</p>
          <ul className="space-y-3 text-sm">
            {features?.map((f: string, idx: number) => (
                <li key={idx} className="flex items-start text-foreground/80">
                  <CheckCircle2 className="w-4 h-4 text-primary mr-3 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
            ))}
          </ul>
       </div>
    </motion.div>
  );
}

function CheckoutModal({ plan, onClose }: any) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', card: '', expiry: '', cvc: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.card || !formData.expiry || !formData.cvc) {
      toast.error('Please fill in all payment details.', { position: 'top-center' });
      return;
    }
    
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      toast.success('Payment successful! Welcome aboard.', { position: 'top-center' });
      
      setTimeout(() => {
        onClose();
        window.location.href = '/register';
      }, 2000);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-5 right-5 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          <div className="p-10 text-center flex flex-col items-center justify-center min-h-[400px]">
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
              className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6"
            >
              <CheckCircle2 className="w-8 h-8" />
            </motion.div>
            <h2 className="text-2xl font-medium mb-2 text-foreground">Subscription Active!</h2>
            <p className="text-muted-foreground text-sm">Redirecting to setup your workspace...</p>
          </div>
        ) : (
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-xl font-medium mb-1 text-foreground">Complete Subscription</h2>
              <p className="text-sm text-muted-foreground">{plan.name} Plan • {plan.price}{plan.period}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                <input 
                  type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="John Doe" disabled={isProcessing}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Email</label>
                  <input 
                    type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="john@example.com" disabled={isProcessing}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Phone</label>
                  <input 
                    type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="+1 (555) 000-0000" disabled={isProcessing}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Card Details</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="text" value={formData.card}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').substring(0, 16);
                      const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                      setFormData({...formData, card: formatted});
                    }}
                    className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="0000 0000 0000 0000" disabled={isProcessing}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Expiry</label>
                  <input 
                    type="text" value={formData.expiry}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').substring(0, 4);
                      const formatted = val.length > 2 ? `${val.substring(0,2)}/${val.substring(2)}` : val;
                      setFormData({...formData, expiry: formatted});
                    }}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="MM/YY" disabled={isProcessing}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">CVC</label>
                  <input 
                    type="text" value={formData.cvc}
                    onChange={(e) => setFormData({...formData, cvc: e.target.value.replace(/\D/g, '').substring(0, 4)})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="123" disabled={isProcessing}
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center space-x-1.5 text-muted-foreground">
                <Lock className="w-3 h-3" />
                <span className="text-[10px] font-medium uppercase tracking-wider">Secure and encrypted</span>
              </div>

              <button 
                type="submit" disabled={isProcessing}
                className="w-full mt-4 py-3 bg-foreground text-background rounded-xl font-medium text-sm transition-all active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-70 shadow-lg hover:opacity-90"
              >
                {isProcessing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /><span>Processing...</span></>
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
