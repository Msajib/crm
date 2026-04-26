'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock the reset process
    toast.loading('Sending reset link...', { id: 'reset' });
    
    setTimeout(() => {
      setSubmitted(true);
      toast.success('Reset link sent!', { id: 'reset' });
    }, 1500);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-background text-foreground relative overflow-hidden">
      <div className="w-full max-w-md p-8 space-y-8 glass rounded-2xl shadow-2xl relative z-10 border border-border">
        
        {!submitted ? (
          <>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/20 text-indigo-500">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="mt-2 text-2xl font-extrabold text-foreground">Forgot Password?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>
            
            <form className="mt-8 space-y-6" onSubmit={handleReset}>
              <div className="rounded-md space-y-4">
                <div>
                  <label htmlFor="email" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1.5 ml-1">Email address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none relative block w-full px-4 py-3 border border-border bg-background placeholder-muted-foreground text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-all"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black uppercase tracking-widest rounded-xl text-white bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-xl shadow-primary/20 transition-all active:scale-95"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center space-y-6 py-6">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
              <Mail className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-foreground">Check your email</h2>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                We've sent a password reset link to <br/>
                <span className="font-bold text-foreground">{email}</span>
              </p>
            </div>
            
            <div className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">Didn't receive the email?</p>
              <button 
                onClick={() => { setSubmitted(false); toast.success('Link resent!'); }}
                className="text-sm font-bold text-primary hover:text-primary/80 transition-colors"
              >
                Click to resend
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 border-t border-border pt-6 text-center">
          <Link href="/login" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
