'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface BrandingContextType {
  logoUrl: string | null;
  workspaceName: string;
  refreshBranding: () => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType>({
  logoUrl: null,
  workspaceName: 'CRM Pro',
  refreshBranding: async () => {},
});

export const useBranding = () => useContext(BrandingContext);

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState('CRM Pro');

  const applyBranding = (data: any) => {
    if (!data) return;

    if (data.name) setWorkspaceName(data.name);
    if (data.logoUrl) setLogoUrl(data.logoUrl);

    // Apply CSS variables
    const root = document.documentElement;
    if (data.primaryColor) {
      root.style.setProperty('--primary', hexToHsl(data.primaryColor));
      // Also update background if needed, but primary is most important
    }
    // We can add secondary/accent if the theme supports them as specific variables
  };

  const fetchBranding = async () => {
    try {
      // 1. Fetch Global System Branding (Baseline)
      const systemData = await api.get('/tenants/system/settings').catch(() => null);
      
      // 2. Fetch Current Tenant Branding (Override)
      const tenantData = await api.get('/tenants/current').catch(() => null);
      
      // Merge: Tenant branding takes priority for primary visual elements if present
      const mergedBranding = {
        name: tenantData?.name || systemData?.systemName || 'CRM Pro',
        logoUrl: tenantData?.logoUrl || systemData?.logoUrl || null,
        faviconUrl: tenantData?.faviconUrl || systemData?.faviconUrl || null,
        primaryColor: tenantData?.primaryColor || systemData?.primaryColor || '#6366f1',
        secondaryColor: tenantData?.secondaryColor || systemData?.secondaryColor || '#4f46e5',
        accentColor: tenantData?.accentColor || systemData?.accentColor || '#f59e0b',
      };

      applyBranding(mergedBranding);
    } catch (err) {
      console.error('Failed to load branding:', err);
    }
  };

  useEffect(() => {
    fetchBranding();
    
    // Listen for branding updates (triggered from the branding settings page)
    const handleUpdate = () => fetchBranding();
    window.addEventListener('branding-updated', handleUpdate);
    return () => window.removeEventListener('branding-updated', handleUpdate);
  }, []);

  return (
    <BrandingContext.Provider value={{ logoUrl, workspaceName, refreshBranding: fetchBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

// Utility to convert hex to HSL format that shadcn/tailwind variables often use
// Expects hex like #6366f1
function hexToHsl(hex: string): string {
  // Remove hash
  hex = hex.replace(/^#/, '');
  
  // Parse r, g, b
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
