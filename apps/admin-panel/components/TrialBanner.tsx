'use client';

import React, { useEffect, useState } from 'react';
import { Clock, X, Zap, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

function getDaysLeft(expiresAt: string): number {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function TrialBanner() {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [role, setRole] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedRole = localStorage.getItem('role') || '';
    setRole(storedRole);

    // Super admins don't see trial banners
    if (storedRole === 'SUPER_ADMIN') return;

    // First check localStorage cache
    const cachedExpiry = localStorage.getItem('trial_expires_at');
    if (cachedExpiry) {
      setDaysLeft(getDaysLeft(cachedExpiry));
    }

    // Also fetch fresh from tenant API
    const token = localStorage.getItem('token');
    const tenantId = localStorage.getItem('tenant_id');
    if (!token || !tenantId) return;

    fetch(`/api/v1/tenants/${tenantId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(tenant => {
        if (tenant?.expiresAt) {
          const days = getDaysLeft(tenant.expiresAt);
          setDaysLeft(days);
          localStorage.setItem('trial_expires_at', tenant.expiresAt);
        }
      })
      .catch(() => {});

    // Check if user dismissed today
    const dismissedAt = sessionStorage.getItem('trial_banner_dismissed');
    if (dismissedAt) setDismissed(true);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('trial_banner_dismissed', new Date().toISOString());
    setDismissed(true);
  };

  // Don't show for super admins, no expiry, or if dismissed
  if (role === 'SUPER_ADMIN' || daysLeft === null || dismissed) return null;

  // Choose styling based on urgency
  const isUrgent = daysLeft <= 3;
  const isWarning = daysLeft <= 7 && daysLeft > 3;
  const isExpired = daysLeft === 0;

  if (isExpired) {
    return (
      <div className="w-full bg-destructive text-white px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <AlertTriangle className="w-5 h-5 shrink-0 animate-pulse" />
          <p className="text-sm font-black">
            Your trial has expired. Your account has been suspended.{' '}
            <Link href="/dashboard/settings/subscription" className="underline font-black hover:opacity-80">
              Upgrade now →
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full px-6 py-2.5 flex items-center justify-between gap-4 transition-all ${
      isUrgent
        ? 'bg-red-500/15 border-b border-red-500/30'
        : isWarning
        ? 'bg-amber-500/10 border-b border-amber-500/20'
        : 'bg-primary/8 border-b border-primary/15'
    }`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
          isUrgent ? 'bg-red-500/20' : isWarning ? 'bg-amber-500/20' : 'bg-primary/20'
        }`}>
          {isUrgent || isWarning
            ? <AlertTriangle className={`w-4 h-4 ${isUrgent ? 'text-red-500' : 'text-amber-500'}`} />
            : <Clock className="w-4 h-4 text-primary" />
          }
        </div>
        <p className={`text-xs font-black ${
          isUrgent ? 'text-red-500' : isWarning ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'
        }`}>
          {isUrgent
            ? `⚠️ Only ${daysLeft} day${daysLeft === 1 ? '' : 's'} left in your trial! Upgrade now to avoid losing access.`
            : isWarning
            ? `Your free trial expires in ${daysLeft} days. Upgrade to keep all your data.`
            : `You are on a free trial. ${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining.`
          }
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/dashboard/settings/subscription"
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            isUrgent
              ? 'bg-red-500 text-white hover:bg-red-600'
              : isWarning
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'bg-primary text-white hover:opacity-90'
          }`}
        >
          <Zap className="w-3 h-3 fill-current" />
          Upgrade
        </Link>
        <button
          onClick={handleDismiss}
          className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          title="Dismiss for this session"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
