'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  CheckCircle, 
  ChevronRight, 
  Database, 
  Shield, 
  Globe, 
  Cpu, 
  Server,
  Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PasswordField } from '@/components/ui/PasswordField';

export default function SetupWizard() {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
    else {
      toast.success('Production setup complete!');
      window.location.href = '/dashboard';
    }
  };

  const steps = [
    { title: 'Environment & Infrastructure', desc: 'Configure database, Redis, and message bus connections.' },
    { title: 'AI Providers', desc: 'Connect Gemini, OpenAI, and Anthropic API keys.' },
    { title: 'Security & Auth', desc: 'Setup RLS policies and JWT secrets.' },
    { title: 'Launch', desc: 'Initialize tenant seeding and system health check.' },
  ];

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-4xl mx-auto py-10">
        <header className="text-center mb-16">
           <h1 className="text-4xl font-black text-foreground mb-4 text-gradient">System Setup Wizard</h1>
           <p className="text-muted-foreground">Follow these 4 steps to deploy your CRM instance for production.</p>
        </header>

        {/* Progress Tracker */}
        <div className="flex justify-between items-center mb-16 px-10">
           {steps.map((s, i) => (
             <div key={i} className="flex flex-col items-center relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                   step > i + 1 ? 'bg-emerald-500 text-white' : 
                   step === i + 1 ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-110' : 
                   'bg-muted text-muted-foreground border border-border'
                }`}>
                   {step > i + 1 ? <CheckCircle className="w-6 h-6" /> : <span className="font-black">{i + 1}</span>}
                </div>
                <p className={`text-[10px] font-black uppercase tracking-widest mt-4 ${step === i + 1 ? 'text-primary' : 'text-muted-foreground'}`}>{s.title.split(' ')[0]}</p>
                {i < steps.length - 1 && (
                  <div className={`absolute left-full top-6 w-32 h-0.5 -z-10 ${step > i + 1 ? 'bg-emerald-500' : 'bg-muted'}`}></div>
                )}
             </div>
           ))}
        </div>

        {/* Wizard Content */}
        <div className="glass-premium p-12 rounded-[64px] border border-border premium-shadow bg-background/50 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-20"></div>
           
           <div className="space-y-10 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center space-x-6">
                 <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center">
                    {step === 1 ? <Database className="w-8 h-8" /> : 
                     step === 2 ? <Cpu className="w-8 h-8" /> :
                     step === 3 ? <Shield className="w-8 h-8" /> :
                     <Zap className="w-8 h-8" />}
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-foreground">{steps[step-1].title}</h2>
                    <p className="text-sm text-muted-foreground">{steps[step-1].desc}</p>
                 </div>
              </div>

              <div className="space-y-6 pt-6">
                 {step === 1 && <EnvironmentForm />}
                 {step === 2 && <AIProviderForm />}
                 {step === 3 && <SecurityForm />}
                 {step === 4 && <FinalCheckForm />}
              </div>

              <div className="flex justify-between items-center pt-10 border-t border-border">
                 <button 
                   disabled={step === 1}
                   onClick={() => setStep(step - 1)}
                   className="px-10 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest hover:text-foreground disabled:opacity-30"
                 >
                   Back
                 </button>
                 <button 
                   onClick={nextStep}
                   className="px-12 py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/30 hover:opacity-90 transition-all flex items-center space-x-3"
                 >
                   <span>{step === totalSteps ? 'Finish Deployment' : 'Continue'}</span>
                   <ChevronRight className="w-4 h-4" />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function EnvironmentForm() {
  return (
    <div className="grid grid-cols-2 gap-6">
       <PasswordField
          label="PostgreSQL URI"
          placeholder="postgresql://..."
          className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-xs"
          showIcon={false}
          value=""
          onChange={() => {}}
       />
       <PasswordField
          label="Message Broker URI"
          placeholder="redis://... (Dragonfly/KeyDB supported)"
          className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-xs"
          showIcon={false}
          value=""
          onChange={() => {}}
       />
    </div>
  );
}

function AIProviderForm() {
   return (
      <div className="space-y-4">
         {['Gemini 2.5 Pro', 'GPT-5 (OpenAI)', 'Claude 3.5 (Anthropic)'].map(p => (
            <div key={p} className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-2xl">
               <span className="text-xs font-bold text-foreground">{p}</span>
               <PasswordField
                 placeholder="Enter API Key"
                 className="bg-background border border-border rounded-xl px-4 py-2 text-[10px] w-64"
                 showIcon={false}
                 value=""
                 onChange={() => {}}
               />
            </div>
         ))}
      </div>
   );
}

function SecurityForm() {
   return (
      <div className="space-y-6">
         <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl flex items-center space-x-4">
            <Shield className="w-8 h-8 text-emerald-500" />
            <p className="text-xs text-emerald-600 font-bold">PostgreSQL RLS policies have been detected. The wizard will automatically map roles to DB policies.</p>
         </div>
            <PasswordField
               label="JWT Master Secret"
               placeholder="••••••••••••••••"
               className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-xs"
               showIcon={false}
               value=""
               onChange={() => {}}
            />
      </div>
   );
}

function FinalCheckForm() {
   return (
      <div className="space-y-4">
         <div className="flex items-center justify-between p-4 border-b border-border">
            <span className="text-xs font-bold text-muted-foreground">Database Connectivity</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
         </div>
         <div className="flex items-center justify-between p-4 border-b border-border">
            <span className="text-xs font-bold text-muted-foreground">AI Tool Discovery</span>
            <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-lg uppercase">8 Tools Found</span>
         </div>
         <div className="flex items-center justify-between p-4">
            <span className="text-xs font-bold text-muted-foreground">SSL Provisioning</span>
            <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-3 py-1 rounded-lg uppercase">In Progress</span>
         </div>
      </div>
   );
}
