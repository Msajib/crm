'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Shield, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { PasswordField } from '@/components/ui/PasswordField';

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
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left Pane - Image/Branding */}
      <div className="hidden md:flex md:w-1/2 bg-muted relative overflow-hidden p-12 flex-col justify-between items-start border-r border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background z-0" />
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-70" />
        
        {/* Branding Logo */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="text-primary-foreground w-5 h-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-foreground">CRM Pro</span>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 max-w-lg mt-auto mb-16">
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-foreground mb-6 leading-tight">
            Accelerate your business relationships.
          </h2>
          <p className="text-lg text-muted-foreground">
            A minimalist, powerful platform designed to help your team manage leads, automate workflows, and close deals faster.
          </p>
        </div>

        {/* Footer info inside left pane */}
        <div className="relative z-10 flex items-center space-x-6 text-sm font-medium text-muted-foreground">
           <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Bank-grade Security</span>
           </div>
           <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4" />
              <span>TLS 1.3 Encrypted</span>
           </div>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-12 relative">
        <div className="w-full max-w-[400px] mx-auto animate-fade-in">
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="md:hidden flex flex-col items-center mb-10 text-center">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20 mb-4">
              <Sparkles className="text-primary-foreground w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">CRM Pro</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-2">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Please enter your credentials to access your account.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5" htmlFor="email">Email address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl py-3 pl-[44px] pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm shadow-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5" htmlFor="password">Password</label>
                <PasswordField
                  id="password"
                  name="password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={setPassword}
                  className="w-full bg-background border border-border rounded-xl py-3 pl-[44px] pr-[44px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input type="checkbox" className="rounded border-border text-primary focus:ring-primary/20 bg-background shadow-sm" />
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center space-x-2 mt-4"
            >
              <span>{isLoading ? 'Signing in...' : 'Sign in'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline underline-offset-4">
              Request access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
