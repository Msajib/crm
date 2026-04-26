'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Shield, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Set cookies for middleware support
        document.cookie = `token=${data.accessToken}; path=/; max-age=86400; SameSite=Strict`;
        document.cookie = `role=${data.user.role}; path=/; max-age=86400; SameSite=Strict`;
        
        // Also keep in localStorage for easy frontend access if needed
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('role', data.user.role);
        
        toast.success('Authentication successful! Initializing workspace...');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 800);
      } else {
        const error = await response.json();
        toast.error(`Access Denied: ${error.message || 'Invalid credentials'}`);
      }
    } catch (err) {
      toast.error('Connection Error: The authentication server is unreachable.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050505]">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 scale-105"
        style={{ 
          backgroundImage: 'url("file:///C:/Users/Elitebook/.gemini/antigravity/brain/0595d929-36b5-4f6f-8c03-8145542dbc6f/crm_login_background_1777154472641.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(10px) brightness(0.3)'
        }}
      />
      
      {/* Animated Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse delay-700" />

      <div className="relative z-10 w-full max-w-[480px] p-4 animate-fade-in">
        <div className="glass-premium rounded-[48px] border border-white/10 p-12 shadow-2xl backdrop-blur-3xl bg-black/40">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/20 border border-primary/30 mb-6 shadow-lg shadow-primary/20">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-3">
              CRM <span className="text-primary italic">Pro</span>
            </h1>
            <p className="text-gray-400 text-sm font-medium">Enterprise Intelligence Suite</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="Intelligence ID (Email)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 pl-14 pr-6 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all text-sm font-medium"
                />
              </div>
              
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  required
                  placeholder="Security Access Key"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 pl-14 pr-6 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-2">
              <label className="flex items-center cursor-pointer group">
                <input type="checkbox" className="hidden peer" />
                <div className="w-5 h-5 border-2 border-white/10 rounded-md bg-white/5 peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="ml-3 text-xs font-bold text-gray-400 group-hover:text-white transition-colors uppercase tracking-widest">Keep Session</span>
              </label>
              <Link href="/forgot-password" stroke-width="3" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest">
                Forgot Key?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full bg-primary hover:bg-primary/90 text-white font-black py-5 rounded-3xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 overflow-hidden"
            >
              <div className="relative z-10 flex items-center justify-center space-x-3 uppercase tracking-[0.2em] text-xs">
                <span>{isLoading ? 'Decrypting...' : 'Initiate Secure Login'}</span>
                {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-xs font-medium text-gray-500">
              New operative?{' '}
              <Link href="/register" className="text-primary font-black hover:underline underline-offset-4">
                REQUEST ACCESS
              </Link>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 flex items-center justify-center space-x-8 opacity-40">
           <div className="flex items-center space-x-2">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-black uppercase text-white tracking-widest">AI Enhanced</span>
           </div>
           <div className="flex items-center space-x-2">
              <Shield className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-black uppercase text-white tracking-widest">TLS 1.3 Secure</span>
           </div>
        </div>
      </div>
    </div>
  );
}
