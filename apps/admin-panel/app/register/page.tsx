'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    size: '',
    industry: '',
    password: '',
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock the registration process
    toast.loading('Creating your workspace...', { id: 'register' });
    
    setTimeout(() => {
      // Simulate successful registration
      localStorage.setItem('token', 'mock_registration_token_' + Date.now());
      toast.success('Welcome to CRM Pro! Your 14-day trial has started.', { id: 'register' });
      window.location.href = '/dashboard';
    }, 1500);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-background text-foreground relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/40 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/40 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md p-8 space-y-8 glass rounded-2xl shadow-2xl relative z-10 border border-border">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
            <span className="text-white font-black text-2xl">C</span>
          </div>
          <h2 className="mt-2 text-3xl font-extrabold text-foreground">Start your 14-day trial</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-primary hover:text-primary/80 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="rounded-md space-y-4">
            <div>
              <label htmlFor="name" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1.5 ml-1">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="appearance-none relative block w-full px-4 py-3 border border-border bg-background placeholder-muted-foreground text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-all"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label htmlFor="email" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1.5 ml-1">Work Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="appearance-none relative block w-full px-4 py-3 border border-border bg-background placeholder-muted-foreground text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-all"
                placeholder="jane@company.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="organization" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1.5 ml-1">Organization Name</label>
                <input
                  id="organization"
                  name="organization"
                  type="text"
                  required
                  value={formData.organization}
                  onChange={(e) => setFormData({...formData, organization: e.target.value})}
                  className="appearance-none relative block w-full px-4 py-3 border border-border bg-background placeholder-muted-foreground text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-all"
                  placeholder="Acme Corp"
                />
              </div>
              <div>
                <label htmlFor="phone" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1.5 ml-1">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="appearance-none relative block w-full px-4 py-3 border border-border bg-background placeholder-muted-foreground text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-all"
                  placeholder="+1 234..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="size" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1.5 ml-1">Company Size</label>
                <select
                  id="size"
                  name="size"
                  required
                  value={formData.size}
                  onChange={(e) => setFormData({...formData, size: e.target.value})}
                  className="appearance-none relative block w-full px-4 py-3 border border-border bg-background text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-all"
                >
                  <option value="" disabled>Select Size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201+">201+ employees</option>
                </select>
              </div>
              <div>
                <label htmlFor="industry" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1.5 ml-1">Industry</label>
                <select
                  id="industry"
                  name="industry"
                  required
                  value={formData.industry}
                  onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  className="appearance-none relative block w-full px-4 py-3 border border-border bg-background text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-all"
                >
                  <option value="" disabled>Select Industry</option>
                  <option value="Tech">Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Retail">Retail</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="password" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1.5 ml-1">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="appearance-none relative block w-full px-4 py-3 border border-border bg-background placeholder-muted-foreground text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black uppercase tracking-widest rounded-xl text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-xl shadow-primary/20 transition-all active:scale-95"
            >
              Create Account
            </button>
          </div>
          <p className="text-center text-[10px] text-muted-foreground leading-relaxed mt-4">
            By creating an account, you agree to our Terms of Service and Privacy Policy. No credit card required.
          </p>
        </form>
      </div>
    </div>
  );
}
