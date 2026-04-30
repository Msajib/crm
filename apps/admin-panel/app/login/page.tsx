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
        // Set cookies for server-side middleware and server-side logout revocation
        document.cookie = `token=${data.accessToken}; path=/; max-age=86400; SameSite=Strict`;
        document.cookie = `role=${data.user.role}; path=/; max-age=86400; SameSite=Strict`;
        if (data.refreshToken) {
          document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=604800; SameSite=Strict`;
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        
        // Also keep in localStorage for easy frontend access
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('tenant_id', data.user.tenantId);
        
        // Set cookies for middleware
        document.cookie = `token=${data.accessToken}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `role=${data.user.role}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `permissions=${JSON.stringify(data.user.permissions || [])}; path=/; max-age=86400; SameSite=Lax`;
        
        toast.success('Authentication successful! Initializing workspace...');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 800);
      } else {
        let errorMessage = 'Invalid credentials';
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            console.error('Failed to parse error JSON:', e);
          }
        } else {
          // If response is not JSON (likely HTML), log it for debugging
          const text = await response.text();
          console.error('Non-JSON Error Response:', text.substring(0, 200));
          if (response.status === 401) {
            errorMessage = 'Invalid credentials';
          } else if (response.status === 403) {
            errorMessage = 'Access denied: account may be suspended';
          } else {
            errorMessage = response.status === 404 
              ? 'API route not found (check Gateway/Proxy)' 
              : `Server Error (${response.status})`;
          }
        }
        toast.error(`Access Denied: ${errorMessage}`);
      }
    } catch (err) {
      console.error('Login request failed:', err);
      toast.error('Connection Error: The authentication server is unreachable.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050505]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0a1a] to-[#1a0a2a] z-0" />
      
      {/* Animated Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[150px] animate-pulse delay-1000" />

      <div className="relative z-10 w-full max-w-[480px] p-4 animate-fade-in">
        <div className="glass-premium rounded-[60px] border border-white/5 p-12 shadow-2xl backdrop-blur-3xl bg-black/40">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-[32px] bg-gradient-to-br from-primary/20 to-purple-500/20 border border-white/10 mb-8 shadow-2xl relative group overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-3">
              CRM <span className="text-primary italic">Pro</span>
            </h1>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">Enterprise Intelligence Suite</p>
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
              <Link href="/forgot-password" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest">
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
